var express = require('express')
var router = express.Router()
const pug = require('pug')


router.get('/', (req, res) => {
    res.send(pug.renderFile('./views/home.pug', {'cache': true}))
})

module.exports = router
