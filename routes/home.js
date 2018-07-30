const express = require('express')
const router = express.Router()
const pug = require('pug')

const homepage = pug.compileFile('./views/home.pug')

router.get('/', (req, res) => {
    res.send(homepage())
})

module.exports = router
