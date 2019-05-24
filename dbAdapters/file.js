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
		console.log('File DB not loaded')
		resolve([])
	}

	var results = []
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
