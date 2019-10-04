const fs = require('fs')
const config = require('./config')

const dbFile = __dirname + '/../dbAdapters/' + config.options.localDB.type + '.js'

// Import the db adapter based on config file
let db = null
fs.stat(dbFile, (err, _) => {
	if (err === null) {
		db = require(dbFile)
	} else {
		throw new Error(err)
	}
})

exports.find = (string, searchOptions) => db.find(string, searchOptions)

exports.add = (recipes) => db.add(recipes)

exports.addIngredient = ingredient => db.addIngredient(ingredient)

exports.delete = title => db.delete(title)

exports.getPantry = () => db.getPantry()

exports.update = recipes => db.update(recipes)

exports.findUser = username => db.findUser(username)

exports.addUser = data => db.addUser(data)
