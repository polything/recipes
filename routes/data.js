const express = require('express')
const router = express.Router()

const config = require('../js/config')
const localDB = require('../js/localDB')
const util = require('../js/util')
const ingredient = require('../js/ingredient')

const REQUEST_TIMEOUT_MS = 500

var validRequest = (req) => {
	return req.body !== undefined || req.body !== null
}

var searchDB = (term, searchOptions, results, findFunc) =>
	new Promise((resolve, _) => {
		findFunc(term, searchOptions)
			.then((dbResults) => {
				for (let dbResult of dbResults) {
					let stored = (recipe) => recipe.title == dbResult.title
					// Don't add to results if it's already there
					if (!results.some(stored)) {
						results.push(dbResult)
					}
				}

				resolve(results)
			})
		setTimeout(resolve, REQUEST_TIMEOUT_MS, results)
	})


// Receive delete request
router.delete('/', (req, res) => {
	if (req.query.title && localDB.delete(req.query.title)) {
		res.status(200)
	} else {
		res.status(404)
	}
})


// Add pantry item
router.post('/add/ingredient', (req, res) => {
	const _ingredient = ingredient.create(req.query)

	if ( _ingredient) {
		localDB.addIngredient(_ingredient)
			.then(() => {
				res.status(200)
			})
			.catch(msg => {
				console.log('Tried adding ' + _ingredient.name + ' with error '
					+ msg)
				res.status(404)
			})
	}
	res.status(400)
})


// Receive add request
router.post('/add', (req, res) => {
	if (!validRequest(req)) return

	if (!(req.body.hasOwnProperty('recipes')
			&& Array.isArray(req.body.recipes)
			&& req.body.recipes.every(recipe => util.isValidRecipe(recipe)))) {
		res.status(304).json({})
		return
	}

	localDB.add(req.body.recipes)
		.then(() => res.status(200).json({}))
		.catch(msg => {
			console.log('Tried adding ' + req.body.recipes + ' with error '
				+ msg)

			res.status(304).json({})
		})
})


// Receive search request
router.post('/', (req, res) => {
	if (!validRequest(req)) return

	var term = req.body.term
	var searchOptions = req.body.options

	Promise.resolve([])
		// Search local
		.then((results) =>
			searchDB(
				term, searchOptions, results, localDB.find
			)
		)
		.then((results) => res.status(200).json(results))
})

module.exports = router
