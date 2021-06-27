require('dotenv').config()
require('./strategies/discord.js')

const express = require('express')
const passport = require('passport')
const app = express()

app.use(passport.initialize())
app.use(passport.session())

const routes = require('./routes/index.js')
app.use('/api', routes)

app.listen(process.env.VUE_APP_PORT, () => console.log(`Server started on port ${process.env.VUE_APP_PORT}`))
