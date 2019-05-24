const express = require('express')
const router = express.Router()

const config = require('../js/config')
const localDB = require('../js/localDB')

const REQUEST_TIMEOUT_MS = 500

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

// Receive data request
router.post('/', (req, res) => {
	if (req.body === undefined || req.body === null) {
		// Ignore these requests
		return
	}

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
