const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const orders = require('./api/orders')

app.use('/api/orders', orders)

const port = 5000

app.listen(port, () => console.log(`Server started on port ${port}`))
