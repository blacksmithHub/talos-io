const express = require('express')

const router = express.Router()

const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')
const qs = require('qs')

/**
 * Place order
 */
router.post('/', async (req, res) => {
  axiosCookieJarSupport(axios)
  const cookieJar = new tough.CookieJar()

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

  const stepOne = await http.post('https://www.titan22.com/rest/V1/carts/mine/payment-information', req.body.payload, { jar: cookieJar, withCredentials: true })
    .then((response) => response)
    .catch(({ response }) => response)

  if (stepOne.status === 200) {
    const stepTwo = await http.get('https://www.titan22.com/ccpp/htmlredirect/gettransactiondata', { jar: cookieJar, withCredentials: true })
      .then((response) => response)
      .catch(({ response }) => response)

    if (stepTwo.status === 200) {
      const parameters = {}
      const fieldRecords = stepTwo.data.fields
      const valueRecords = stepTwo.data.values

      for (let index = 0; index < fieldRecords.length; index++) {
        parameters[fieldRecords[index]] = valueRecords[index]
      }

      const http = axios.create(options)

      http.interceptors.request.use(async config => {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        return config
      })

      await http.post('https://t.2c2p.com/RedirectV3/Payment', qs.stringify(parameters), { jar: cookieJar, withCredentials: true })
        .then((response) => response)
        .catch(({ response }) => response)

      const cookie = cookieJar.store.idx['2c2p.com']['/']['ASP.NET_SessionId']

      res.status(200).send({
        cookies: {
          name: 'ASP.NET_SessionId',
          value: cookie.value,
          domain: '.2c2p.com'
        },
        data: parameters
      })
    } else {
      res.status(stepOne.status).send({})
    }
  } else {
    res.status(stepOne.status).send({})
  }
})

module.exports = router
