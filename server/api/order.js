const express = require('express')
const UserAgent = require('user-agents')
const router = express.Router()
const StopWatch = require('statman-stopwatch')

/**
 * Place 2c2p order
 */
router.post('/2c2p', async (req, res) => {
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

  let device = null
  let agent = null

  switch (req.body.mode) {
    case 'Mobile (Android)':
      {
        const userAgentAnd = new UserAgent({ deviceCategory: 'mobile' })
        agent = userAgentAnd.toString()
        device = 'android'
      }
      break

    case 'Mobile (iOS)':
      {
        const userAgentIos = new UserAgent({ deviceCategory: 'mobile' })
        agent = userAgentIos.toString()
        device = 'ios'
      }
      break
    default:
      {
        const userAgent = new UserAgent()
        agent = userAgent.toString()
      }
      break
  }

  const placeOrder = {
    uri: 'https://www.titan22.com/rest/V1/carts/mine/payment-information',
    body: JSON.stringify(req.body.payload),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.body.token}`,
      'User-Agent': agent
    },
    jar
  }

  if (device) placeOrder.headers.client = device

  const timer = new StopWatch(true)

  await request(placeOrder, async function (error, response) {
    timer.stop()

    const speed = (timer.read() / 1000.0).toFixed(2)

    try {
      if (error) {
        res.status(response.statusCode).send(error)
      } else {
        const getTransactionData = {
          uri: 'https://www.titan22.com/ccpp/htmlredirect/gettransactiondata',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': agent
          },
          jar
        }

        if (device) getTransactionData.headers.client = device

        await request(getTransactionData, async function (error, response) {
          try {
            if (error) {
              res.status(response.statusCode).send(error)
            } else {
              let orderNumber = null
              const parameters = {}
              const fieldRecords = JSON.parse(response.body).fields
              const valueRecords = JSON.parse(response.body).values

              for (let index = 0; index < fieldRecords.length; index++) {
                parameters[fieldRecords[index]] = valueRecords[index]
                if (fieldRecords[index] === 'order_id') orderNumber = valueRecords[index]
              }

              const payment = {
                uri: 'https://t.2c2p.com/RedirectV3/Payment',
                form: parameters,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'User-Agent': agent
                },
                jar
              }

              if (device) payment.headers.client = device

              await request(payment, function (error, response) {
                try {
                  if (error) {
                    res.status(response.statusCode).send(error)
                  } else {
                    jar._jar.store.getAllCookies(function (err, cookieArray) {
                      if (err) {
                        res.status(500).send(err)
                      } else {
                        const collection = cookieArray.find((val) => val.key === 'ASP.NET_SessionId')

                        res.status(200).send({
                          cookie: {
                            name: 'ASP.NET_SessionId',
                            value: collection.value,
                            domain: '.2c2p.com',
                            expiry: collection.expiry
                          },
                          data: orderNumber,
                          timer: speed
                        })
                      }
                    })
                  }
                } catch (exception) {
                  res.status(500).send(exception)
                }
              })
            }
          } catch (exception) {
            res.status(500).send(exception)
          }
        })
      }
    } catch (exception) {
      res.status(500).send(exception)
    }
  })
})

/**
 * Place paymaya order
 */
router.post('/paymaya', async (req, res) => {
  let request = require('request')

  const option = {}

  if (req.body.proxy.username && req.body.proxy.password) {
    option.proxy = `http://${req.body.proxy.username}:${req.body.proxy.password}@${req.body.proxy.host}:${req.body.proxy.port}`
  } else {
    option.proxy = `http://${req.body.proxy.host}:${req.body.proxy.port}`
  }

  request = request.defaults(option)

  const jar = request.jar()

  const placeOrder = {
    uri: 'https://www.titan22.com/rest/V1/carts/mine/payment-information',
    body: JSON.stringify(req.body.payload),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.body.token}`
    },
    jar
  }

  const timer = new StopWatch(true)

  await request(placeOrder, async function (error, response) {
    timer.stop()

    const speed = (timer.read() / 1000.0).toFixed(2)

    try {
      if (error) {
        res.status(response.statusCode).send(error)
      } else {
        const getTransactionData = {
          uri: 'https://www.titan22.com/paymaya/checkout/start',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          jar
        }

        await request(getTransactionData, async function (error, response) {
          try {
            if (error) {
              res.status(response.statusCode).send(error)
            } else {
              res.status(200).send({
                data: response,
                timer: speed
              })
            }
          } catch (exception) {
            res.status(500).send(exception)
          }
        })
      }
    } catch (exception) {
      res.status(500).send(exception)
    }
  })
})

module.exports = router
