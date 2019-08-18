const bcrypt = require('bcrypt')
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

	if (!data.hasOwnProperty('users')) {
		data.users = {}
	}
	loaded = true
})

exports.find = (string, options) => new Promise((resolve, _) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	const results = []
	for (const key in data.recipes) {
		const recipe = data.recipes[key]
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

	if (title in data.recipes) {
		delete data.recipes[title]
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

exports.findUser = username => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	resolve(data.users[username])
})

exports.addUser = userData => new Promise((resolve, reject) => {
	if (!loaded) {
		return reject(NOT_LOADED_MSG)
	}

	if (data.users[userData.username] === undefined) {
		bcrypt.hash(userData.password, config.options.security.saltRounds, (err, hash) => {
			let user = {
				username: userData.username,
				password: hash
			}
			data.users[user.username] = user

			fs.writeFileSync(config.options.localDB.options.filePath,
				JSON.stringify(data))

			resolve(true)
		})
	} else {
		resolve(false)
	}
})
