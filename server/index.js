const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const request = require('./api/request')
const order = require('./api/order')

app.use('/api/request', request)
app.use('/api/order', order)

const port = 5000

app.listen(port, () => console.log(`Server started on port ${port}`))
