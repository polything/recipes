const express = require('express')
const path = require('path')
const pug = require('pug')
const router = express.Router()

const cssURL = path.join(process.env.ROOT_URL, 'css')
const jsURL = path.join(process.env.ROOT_URL, 'js')
const dataURL = path.join(process.env.ROOT_URL, 'data')
const recipeURL = path.join(process.env.ROOT_URL, 'recipe')

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
