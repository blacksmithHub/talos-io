const router = require('express').Router()
const passport = require('passport')
const refresh = require('passport-oauth2-refresh')
const DiscordStrategy = require('passport-discord')
const fs = require('fs')

router.get('/discord', passport.authenticate('discord'))

router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
  res.send(200)
})

router.get('/', (req, res) => {
  refresh.use(
    new DiscordStrategy({
      clientID: process.env.VUE_APP_DISCORD_CLIENT_ID,
      clientSecret: process.env.VUE_APP_DISCORD_CLIENT_SECRET,
      callbackURL: process.env.VUE_APP_REDIRECT,
      scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken
      profile.refreshToken = refreshToken

      fs.writeFileSync('User.json', JSON.stringify(profile))

      return done(null, profile)
    })
  )

  let data = {}

  try {
    data = JSON.parse(fs.readFileSync('User.json', 'utf8'))
  } catch (error) {
    data = {}
  }

  if (data.refreshToken) {
    refresh.requestNewAccessToken('discord', data.refreshToken, async (err, accessToken, refreshToken) => {
      if (!err) {
        data.accessToken = accessToken
        data.refreshToken = refreshToken

        const axios = require('axios')

        const mainServer = '764353730035974205'
        const mainRoles = [
          '785889077115093002',
          '772429687787880448'
        ]
        const partners = [
          '712402941625106432',
          '724842418729517088'
        ]
        const servers = partners.slice()

        servers.push(mainServer)

        for (let index = 0; index < servers.length; index++) {
          const profile = await axios({
            url: `https://discord.com/api/v8/guilds/${servers[index]}/members/${data.id}`,
            method: 'get',
            headers: { Authorization: `Bot ${process.env.VUE_APP_DISCORD_BOT_TOKEN}` }
          })
            .then(({ data }) => data)
            .catch(({ response }) => response)

          if (profile.status) continue

          data.guilds = data.guilds.map(el => {
            if (el.id === servers[index]) el.profile = profile

            return el
          })
        }

        fs.writeFileSync('User.json', JSON.stringify(data))

        let partnered = false

        for (let index = 0; index < partners.length; index++) {
          const guild = data.guilds.find(el => el.id === partners[index])

          if (guild) {
            partnered = true
            break
          }
        }

        const guild = data.guilds.find(el => el.id === mainServer)

        if (guild && guild.profile.roles.some(r => mainRoles.includes(r)) && partnered) {
          res.send(data)
        } else {
          res.status(401).send({ msg: 'Missing access' })
        }
      } else {
        res.status(400).send(err)
      }
    })
  } else {
    res.status(400).send({ msg: 'Unauthorized' })
  }
})

module.exports = router
