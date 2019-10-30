const Promise = require('promise')
const fs = require('fs')

const config = require('../js/config')
const util = require('../js/util')

const defaultSearchOpts = {
	title: false,
	ingredients: false,
	exact: false,
}

let data = null
let loaded = false
const NOT_LOADED_MSG = 'File DB not loaded'

// Async load data
fs.readFile(config.options.localDB.options.filePath, 'utf8', (err, contents) => {
	if (err) {
		// eslint-disable-next-line no-console
		console.log('ERROR: File DB failed.' + err)
		return
	}

	data = JSON.parse(contents)

	data.recipes = data.recipes || []
	data.users = data.users || {}
	loaded = true
})

exports.find = (term, options) => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	term = term.toLowerCase()
	options = util.fillMissingOpts(options, defaultSearchOpts)
	const results = []
	for (const key in data.recipes) {
		const recipe = data.recipes[key]

		if (options.title) {
			const title = recipe.title.toLowerCase()

			if (options.exact && title === term) {
				results.push(recipe)
				continue
			} else if (!options.exact && title.indexOf(term) !== -1) {
				results.push(recipe)
				continue
			}
		}
		
		if (options.ingredients) {
			for (const ingredient of recipe.ingredients) {
				const name = ingredient.name.toLowerCase()

				if (name.indexOf(term) !== -1) {
					results.push(recipe)
					continue
				}
			}
		}
	}
	resolve(results)
})

exports.update = (recipes) => new Promise((resolve, reject) => {
	if (!loaded) {
		reject(NOT_LOADED_MSG)
	}

	recipes.forEach(recipe => {
		data.recipes[recipe.title] = recipe
	})

	fs.writeFileSync(config.options.localDB.options.filePath,
		JSON.stringify(data))

	resolve()
})

exports.add = (recipes) => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	recipes.forEach((recipe) => {
		if (!(recipe.title in data.recipes)) {
			data.recipes[recipe.title] = recipe
		}
	})

	fs.writeFileSync(config.options.localDB.options.filePath,
		JSON.stringify(data))

	resolve()
})

exports.addIngredient = ingredient => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	if (!data.pantry[ingredient.name]) {
		data.pantry[ingredient.name] = ingredient
		fs.writeFileSync(config.options.localDB.options.filePath,
			JSON.stringify(data))
	}

	resolve()
})

exports.delete = (title) => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	if (title in data.recipes) {
		delete data.recipes[title]
		fs.writeFileSync(config.options.localDB.options.filePath,
			JSON.stringify(data))
	}

	resolve()
})

exports.getPantry = async (user) => {
	if (!loaded) {
		return {
			err: NOT_LOADED_MSG,
			pantry: null,
		}
	}

	const results = {}
	const pantry = user.pantry
	for (const key in pantry) {
		results[key] = pantry[key]
	}
	return {
		err: null,
		'pantry': results,
	}
}

exports.findUser = async (username) => {
	if (!loaded) {
		return {
			err: NOT_LOADED_MSG,
			user: null,
		}
	}

	return {
		err: null,
		user: data.users[username],
	}
}

exports.addUser = userData => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	if (data.users[userData.username] === undefined) {
		data.users[userData.username] = userData

		fs.writeFileSync(config.options.localDB.options.filePath,
			JSON.stringify(data))

		resolve(true)
	} else {
		resolve(false)
	}
})
