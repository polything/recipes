const express = require('express')
const router = express.Router()
const db = require('../js/dbAdapter.js')
const pug = require('pug')

const homepage = pug.compileFile('./views/home.pug')

router.get('/', (req, res) => {
    db.find('arm')
        .then((recipes) => {
            res.send(homepage({'recipes': recipes}))
        })
})

module.exports = router
