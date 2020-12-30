const express = require('express')
const axios = require('axios')

const router = express.Router()

/**
 * Post request
 */
router.post('/post', async (req, res) => {
  const options = {}

  const proxy = req.body.proxy

  if (proxy) {
    options.proxy = {
      host: proxy.host,
      port: proxy.port,
      auth: {
        username: proxy.username,
        password: proxy.password
      }
    }
  }

  const http = axios.create(options)

  http.interceptors.request.use(async config => {
    /**
     * Set Headers config
     */
    config.headers.Accept = 'application/json'
    if (req.body.token) config.headers.Authorization = `Bearer ${req.body.token}`

    return config
  })

  await http.post(req.body.url, req.body.payload)
    .then((response) => res.status(response.status).send(response.data))
    .catch(({ response }) => {
      let arg = null

      try {
        arg = response.data.message
      } catch (error) {
        arg = {}
      }

      res.status(response.status).send(arg)
    })
})

/**
 * Get request
 */
router.post('/get', async (req, res) => {
  const options = {}

  const proxy = req.body.proxy

  if (proxy) {
    options.proxy = {
      host: proxy.host,
      port: proxy.port,
      auth: {
        username: proxy.username,
        password: proxy.password
      }
    }
  }

  const http = axios.create(options)

  http.interceptors.request.use(async config => {
    /**
     * Set Headers config
     */
    config.headers.Accept = 'application/json'
    if (req.body.token) config.headers.Authorization = `Bearer ${req.body.token}`

    return config
  })

  await http.get(req.body.url)
    .then((response) => res.status(response.status).send(response.data))
    .catch(({ response }) => {
      let arg = null

      try {
        arg = response.data.message
      } catch (error) {
        arg = {}
      }

      res.status(response.status).send(arg)
    })
})

/**
 * Delete request
 */
router.post('/delete', async (req, res) => {
  const options = {}

  const proxy = req.body.proxy

  if (proxy) {
    options.proxy = {
      host: proxy.host,
      port: proxy.port,
      auth: {
        username: proxy.username,
        password: proxy.password
      }
    }
  }

  const http = axios.create(options)

  http.interceptors.request.use(async config => {
    /**
     * Set Headers config
     */
    config.headers.Accept = 'application/json'
    if (req.body.token) config.headers.Authorization = `Bearer ${req.body.token}`

    return config
  })

  await http.delete(req.body.url)
    .then((response) => res.status(response.status).send(response.data))
    .catch(({ response }) => {
      let arg = null

      try {
        arg = response.data.message
      } catch (error) {
        arg = {}
      }

      res.status(response.status).send(arg)
    })
})

module.exports = router
