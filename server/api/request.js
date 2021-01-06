const express = require('express')

const router = express.Router()

/**
 * API request
 */
router.post('/', async (req, res) => {
  let request = require('request')

  const option = {}

  if (req.body.proxy) {
    if (req.body.proxy.username && req.body.proxy.password) {
      option.proxy = `http://${req.body.proxy.username}:${req.body.proxy.password}@${req.body.proxy.host}:${req.body.proxy.port}`
    } else {
      option.proxy = `http://${req.body.proxy.host}:${req.body.proxy.port}`
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

  if (req.body.token) config.headers.Authorization = `Bearer ${req.body.token}`

  if (req.body.payload) config.body = JSON.stringify(req.body.payload)

  await request(config, async function (error, response) {
    try {
      if (error) {
        res.status(response.statusCode).send(error)
      } else {
        res.status(response.statusCode).send(response.body)
      }
    } catch (exception) {
      res.status(500).send(exception)
    }
  })
})

module.exports = router
