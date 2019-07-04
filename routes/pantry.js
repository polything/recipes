const express = require('express')
const router = express.Router()
const path = require('path')
const pug = require('pug')

const config = require('../js/config.js')

const cssURL = path.join(config.options.rootURL, 'css')
const jsURL = path.join(config.options.rootURL, 'js')
const dataURL = path.join(config.options.rootURL, 'data')

router.get('/', (req, res) => {
	res.send(pug.renderFile('./views/pantry.pug', {
		'cssURL': cssURL,
		'dataURL': dataURL,
		'jsURL': jsURL,
	}))
})

module.exports = router

