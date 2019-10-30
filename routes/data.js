const express = require('express')
const passportConfig = require('../auth/passport')
const router = express.Router()

const config = require('../js/config')
const crypto = require('../js/crypto')
const db = require('../js/localDB')
const util = require('../js/util')
const ingredient = require('../js/ingredient')

const REQUEST_TIMEOUT_MS = 500

const validRequest = (req) => {
	return req.body !== undefined && req.body !== null
}

const searchDB = (term, searchOptions, results, findFunc) =>
	new Promise((resolve, _) => {
		findFunc(term, searchOptions)
			.then((dbResults) => {
				// Filter dbResults in case of concurrent searchDB() calls
				for (const dbResult of dbResults) {
					const isStored = (recipe) =>
						recipe.title.toLowerCase()
							=== dbResult.title.toLowerCase()

					// Don't add to results if it's already there
					if (!results.some(isStored)) {
						results.push(dbResult)
					}
				}

				resolve(results)
			})
		setTimeout(resolve, REQUEST_TIMEOUT_MS, results)
	})


// Receive delete request
router.delete('/', (req, res) => {
	if (req.query.title && db.delete(req.query.title)) {
		res.status(200)
	} else {
		res.status(404)
	}
})


// Get pantry
router.get('/pantry', passportConfig.isAuthenticated, async (req, res) => {
	if (!req.user) {
		return res.status(400).end()
	}

	const {err, pantry} = await db.getPantry(req.user)
	if (err) { return res.status(500).json({}).end() }
	return res.status(200).json(pantry).end()
})


// Add pantry item
router.post('/add/ingredient', (req, res) => {
	const _ingredient = ingredient.create(req.query)

	if (_ingredient) {
		db.addIngredient(_ingredient)
			.then(() => {
				res.status(200).end()
			})
			.catch(msg => {
				// eslint-disable-next-line no-console
				console.log('Tried adding ' + _ingredient.name + ' with error '
					+ msg)
				res.status(404).end()
			})
	} else {
		res.status(400).end()
	}
})


// Add recipe request
router.post('/add', (req, res) => {
	if (!validRequest(req)) return

	if (!(req.body.recipes
			&& Array.isArray(req.body.recipes)
			&& req.body.recipes.every(recipe => util.isValidRecipe(recipe)))) {
		res.status(304).json({}).end()
		return
	}

	db.add(req.body.recipes)
		.then(() => res.status(200).json({}).end())
		.catch(msg => {
			// eslint-disable-next-line no-console
			console.log('Tried adding ' + req.body.recipes + ' with error '
				+ msg)

			res.status(304).json({}).end()
		})
})


// Receive search request
router.post('/', (req, res) => {
	if (!validRequest(req)) {
		res.status(400).json({}).end()
		return
	}

	const term = req.body.term
	const searchOptions = req.body.options

	Promise.resolve([])
		// Search local
		.then((results) => searchDB(term, searchOptions, results, db.find))
		.then((results) => res.status(200).json(results).end())
})

router.get('/recipe/:name', (req, res) => {
	const name = req.params.name
	const opts = {
		title: true,
		exact: true,
	}
	db.find(name, opts)
		.then(data => {
			const ret = data.length > 0 ? data[0] : {}
			res.status(200).json(ret).end()
		})
		.catch(msg => {
			// eslint-disable-next-line no-console
			console.log(msg)
			res.status(500).end()
		})
})

router.post('/recipe/edit', (req, res) => {
	if (!(req.body.recipes
			&& Array.isArray(req.body.recipes)
			&& req.body.recipes.every(recipe => util.isValidRecipe(recipe)))) {
		res.status(304).json({}).end()
		return
	}

	db.update(req.body.recipes)
		.then(() => res.status(200).json({}).end())
		.catch(msg => {
			// eslint-disable-next-line no-console
			console.log(msg)
			res.status(304).json({}).end()
		})
})

router.get('/profile/createAllowed', (req, res) => {
	res.status(200).json({
		'allowed': config.options.allowAccountCreation
	}).end()
})

router.post('/profile/create', (req, res, next) => {
	if (!config.options.allowAccountCreation) {
		res.status(405).json({}).end()
		return
	}

	crypto.hash(req.body.password)
		.then(hash => {
			const user = {
				username: req.body.username,
				password: hash,
				pantry: {},
				recipes: [],
			}

			db.addUser(user)
				.then((success) => {
					if (success) {
						req.login(user, (err) => {
							if (err) return next(err)

							res.status(200).json({}).end()
						})
					} else {
						res.status(400).json({}).end()
					}
				})
				.catch((err) => {
					// eslint-disable-next-line no-console
					console.log(err)
					res.status(500).json({}).end()
				})
		})
		.catch(msg => {
			// eslint-disable-next-line no-console
			console.log(msg)
			res.status(500).json({}).end()
		})
})

router.get('/profile/logout', function(req, res) {
	req.logout()
	res.status(200).json({}).end()
})

module.exports = router
