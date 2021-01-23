const http = require('http').createServer()
const io = require('socket.io')(http)

io.on('connection', (socket) => {
  const service = require('./service')
  const automate = require('./automate')

  // verify task
  socket.on('socket-verify', async (task) => {
    service.tasks.push(task)
    automate.verify(task, socket)
  })

  // start task
  socket.on('socket-start', async (task) => {
    service.tasks.push(task)
    automate.start(task, socket)
  })

  // stop task
  socket.on('socket-stop', async (task) => {
    await automate.stop(task)

    const item = service.tasks.find((el) => el.id === task.id)

    if (item) {
      const index = service.tasks.indexOf(item)
      service.tasks.splice(index, 1)
    }
  })

  // update task
  socket.on('socket-update', async (tasks) => {
    service.tasks = service.tasks.map(element => {
      const task = tasks.find((val) => val.id === element.id)

      if (task) {
        element = {
          ...task,
          transactionData: element.transactionData
        }
      }

      return element
    })
  })

  // backend monitor
  socket.on('socket-monitor', async (req, callback) => {
    const service = require('./service')
    const qs = require('qs')
    const UserAgent = require('user-agents')
    const axios = require('axios')
    const query = qs.stringify(req.payload)
    const userAgent = new UserAgent()

    const requestHeaders = {
      method: 'get',
      url: `${service.api.search_product}?${query}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${service.token}`,
        'User-Agent': userAgent.toString()
      }
    }

    if (req.proxy) requestHeaders.proxy = req.proxy

    const response = await axios(requestHeaders)
      .then(({ data }) => data)
      .catch(({ response }) => response)

    if (callback) return callback(response)
  })

  // fetch attributes
  socket.on('socket-attribute', async (req, callback) => {
    const service = require('./service')
    const qs = require('qs')
    const UserAgent = require('user-agents')
    const axios = require('axios')
    const query = qs.stringify(req)
    const userAgent = new UserAgent()

    const requestHeaders = {
      method: 'get',
      url: `${service.api.product_attributes}?${query}`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${service.token}`,
        'User-Agent': userAgent.toString()
      }
    }

    const response = await axios(requestHeaders)
      .then(({ data }) => data)
      .catch(({ response }) => response)

    if (callback) return callback(response)
  })
})

const getPort = require('get-port')

const port = getPort({ port: getPort.makeRange(5000, 5100) });

(async () => {
  const availPort = await port

  http.listen(availPort, () => {
    console.log(`Server started on port ${availPort}`)
  })
})()

module.exports = port
