const router = require('express').Router()
const auth = require('./auth.js')

router.use('/auth', auth)

module.exports = router
