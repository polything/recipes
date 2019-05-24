const fs = require('fs')
const config = require('./config')

const dbFile = __dirname + '/../dbAdapters/' + config.options.localDB.type + '.js'
// Import the db adapter based on config file
var db = null
fs.stat(dbFile, (err, _) => {
	if (err === null) {
		db = require(dbFile)
	} else {
		throw new Error(err)
	}
})

exports.find = (string, searchOptions) => db.find(string, searchOptions)
