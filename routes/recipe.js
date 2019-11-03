const express = require('express')
const pug = require('pug')
const router = express.Router()

router.get('/', (req, res) => {
	res.redirect(process.env.ROOT_URL)
})

router.get('/:recipeTitle', (req, res) => {
	const options = {ingredients:false, title: true}
	const term = req.params.recipeTitle
	db.find(term, options)
		.then((results) => {
			const recipe = (results.length > 0 ? results[0] : null)
			res.send(pug.renderFile('./views/recipe.pug', {'recipe': recipe}))
		})
})

module.exports = router
