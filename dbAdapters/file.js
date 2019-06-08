const Promise = require('promise')
const fs = require('fs')
const config = require('../js/config')
var data = null
var loaded = false

// Async load data
fs.readFile(config.options.localDB.options.filePath, 'utf8', (err, contents) => {
	if (err) {
		console.log('ERROR: File DB failed.' + err)
		return
	}

	data = JSON.parse(contents)
	loaded = true
})

exports.find = (string, options) => new Promise((resolve, _) => {
	if (!loaded) {
		return reject('File DB not loaded')
	}

	const results = []
	data.recipes.forEach((recipe) => {
		if ((options === undefined || options.title === true)
				&& recipe.title.indexOf(string) !== -1) {
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

exports.add = (recipes) => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject('FileDB not loaded')
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
