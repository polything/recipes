const express = require('express')
const router = express.Router()
const path = require('path')
const pug = require('pug')

const passport = require('passport')

router.get('/', passport.authenticationMiddleware(), (req, res) => {
	res.send(pug.renderFile('./views/profile.pug', {}))
})

module.exports = router

