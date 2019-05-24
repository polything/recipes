const fs = require('fs')

defaults = {
	"port": 3000,
	"rootURL": "/",
	"localDB": {
		"type": "file",
		"options": {
			"filePath": "dbAdapters/recipes.json"
		}
	}
}

getTypeString = (obj) => Object.prototype.toString.call(obj).slice(8, -1)

function addUnspecifiedSettings(config, defaultValues) {
	for (key in defaultValues) {
		if (!(key in config)) {
			config[key] = defaultValues[key]
		} else if (getTypeString(config[key]) == "Object") {
			addUnspecifiedSettings(config[key], defaultValues[key])
		}
	}
	return config
}

exports.options = {}

exports.load = (configPath) => new Promise((resolve, reject) => {
	fs.readFile(configPath, 'utf8', (err, contents) => {
		if (err) reject(err)
		exports.options = addUnspecifiedSettings(JSON.parse(contents), defaults)
		resolve(exports.options)
	})
})
