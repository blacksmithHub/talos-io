const passport = require('passport')
const DiscordStrategy = require('passport-discord')
const fs = require('fs')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (discordId, done) => {
  try {
    const user = await fs.readFileSync('User.json', 'utf8')

    console.log(user)

    return user ? done(null, user) : done(null, null)
  } catch (err) {
    console.log(err)
    done(err, null)
  }
})

passport.use(
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
