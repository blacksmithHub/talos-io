const express = require('express')
const UserAgent = require('user-agents')
const router = express.Router()

/**
 * API request
 */
router.post('/', async (req, res) => {
  let request = require('request')

  const option = {}

  if (req.body.proxy && Object.keys(req.body.proxy).length && req.body.proxy.proxies.length) {
    const proxy = req.body.proxy.proxies[Math.floor(Math.random() * req.body.proxy.proxies.length)]

    if (proxy.username && proxy.password) {
      option.proxy = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    } else {
      option.proxy = `http://${proxy.host}:${proxy.port}`
    }
  }

  request = request.defaults(option)

  const jar = request.jar()

  const config = {
    uri: req.body.url,
    method: req.body.method,
    headers: { 'Content-Type': 'application/json' },
    jar
  }

  switch (req.body.mode) {
    case 'Mobile (Android)':
      {
        const userAgentAnd = new UserAgent({ deviceCategory: 'mobile' })
        config.headers['User-Agent'] = userAgentAnd.toString()
        config.headers.client = 'android'
      }
      break

    case 'Mobile (iOS)':
      {
        const userAgentIos = new UserAgent({ deviceCategory: 'mobile' })
        config.headers['User-Agent'] = userAgentIos.toString()
        config.headers.client = 'ios'
      }
      break
    default:
      {
        const userAgent = new UserAgent()
        config.headers['User-Agent'] = userAgent.toString()
      }
      break
  }

  if (req.body.token) config.headers.Authorization = `Bearer ${req.body.token}`

  if (req.body.payload) config.body = JSON.stringify(req.body.payload)

  await request(config, async function (error, response) {
    try {
      if (error) {
        res.status(500).send(error)
      } else {
        res.status(response.statusCode).send(response.body)
      }
    } catch (exception) {
      res.status(500).send(exception)
    }
  })
})

module.exports = router
