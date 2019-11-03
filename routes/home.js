const express = require('express')
const router = express.Router()
const path = require('path')
const pug = require('pug')

const cssURL = path.join(process.env.ROOT_URL, 'deps/css')
const jsURL = path.join(process.env.ROOT_URL, 'deps/js')
const dataURL = path.join(process.env.ROOT_URL, 'data')
const recipeURL = path.join(process.env.ROOT_URL, 'recipe')

router.get('/', (req, res) => {
	res.send(pug.renderFile('./views/app.pug', {
		'cssURL': cssURL,
		'dataURL': dataURL,
		'jsURL': jsURL,
		'recipeURL': recipeURL,
	}))
})

module.exports = router
