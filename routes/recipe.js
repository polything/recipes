const config = require('../js/config.js')
const db = require('../js/localDB.js')
const express = require('express')
const pug = require('pug')
const router = express.Router()

router.get('/', (req, res) => {
	res.redirect(config.options.rootURL)
})

router.get('/:recipeTitle', (req, res) => {
	var options = {ingredients:false, title: true}
	var term = req.params.recipeTitle
	db.find(term, options)
		.then((results) => {
			var recipe = (results.length > 0 ? results[0] : null)
			res.send(pug.renderFile('./views/recipe.pug', {'recipe': recipe}))
	})
})

module.exports = router
