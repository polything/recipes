const Promise = require('promise')
const fs = require('fs')
const config = require('../js/config')

var data = null
var loaded = false
const NOT_LOADED_MSG = 'File DB not loaded'

// Async load data
fs.readFile(config.options.localDB.options.filePath, 'utf8', (err, contents) => {
	if (err) {
		console.log('ERROR: File DB failed.' + err)
		return
	}

	data = JSON.parse(contents)

	if (!data.hasOwnProperty('recipes')) {
		data.recipes = []
	}

	if (!data.hasOwnProperty('pantry')) {
		data.pantry = {}
	}
	loaded = true
})

exports.find = (string, options) => new Promise((resolve, _) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	const results = []
	data.recipes.forEach((recipe) => {
		if ((options === undefined || options.title === true)
			&& ((options.exact === true && string === recipe.title)
				|| (options.exact === false
					&& recipe.title.indexOf(string) !== -1))) {

			results.push(recipe)
		}
		else if (options === undefined || options.ingredients === true) {
			for (let ingredient of recipe.ingredients) {
				if (ingredient.name.indexOf(string) !== -1) {
					results.push(recipe)
					break
				}
			}
		}
	})
	resolve(results)
})

exports.update = (recipes) => new Promise((resolve, reject) => {
	if (!loaded) {
		reject(NOT_LOADED_MSG)
	}

	recipes.forEach(recipe => {
		const idx = data.recipes.findIndex(_recipe => _recipe.title === recipe.title)
		if (idx === -1) {
			data.recipes.push(recipe)
		} else {
			data.recipes[idx] = recipe
		}
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
		if (data.recipes.every(_recipe => recipe.title !== _recipe.title)) {
			data.recipes.push(recipe)
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

	if (!data.pantry.hasOwnProperty(ingredient.name)) {
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

	const deleteIdx = data.recipes.findIndex(recipe => recipe.title === title)

	if (deleteIdx !== -1) {
		data.recipes.splice(deleteIdx, 1)
		fs.writeFileSync(config.options.localDB.options.filePath,
			JSON.stringify(data))
	}

	resolve()
})

exports.getPantry = () => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	const results = {}
	for (let key in data.pantry) {
		results[key] = data.pantry[key]
	}
	resolve(results)
})
