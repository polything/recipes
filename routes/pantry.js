const express = require('express')
const router = express.Router()
const path = require('path')
const pug = require('pug')

const cssURL = path.join(process.env.ROOT_URL, 'css')
const jsURL = path.join(process.env.ROOT_URL, 'js')
const dataURL = path.join(process.env.ROOT_URL, 'data')

router.get('/', (req, res) => {
	res.send(pug.renderFile('./views/pantry.pug', {
		'cssURL': cssURL,
		'dataURL': dataURL,
		'jsURL': jsURL,
	}))
})

module.exports = router

