const express = require('express')
const path = require('path')
const pug = require('pug')
const router = express.Router()

const config = require('../js/config.js')

const cssURL = path.join(config.options.rootURL, 'css')
const jsURL = path.join(config.options.rootURL, 'js')
const dataURL = path.join(config.options.rootURL, 'data')
const recipeURL = path.join(config.options.rootURL, 'recipe')

router.get('/', (req, res) => {
	res.send(pug.renderFile('./views/add.pug', {
		'cssURL': cssURL,
		'dataURL': dataURL,
		'jsURL': jsURL,
		'recipeURL': recipeURL
	}))
})

router.get('/ingredient', (req, res) => {
	res.send(pug.renderFile('./views/addIngredient.pug', {
		'cssURL': cssURL,
		'dataURL': dataURL,
		'jsURL': jsURL,
	}))
})

module.exports = router
