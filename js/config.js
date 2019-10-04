const fs = require('fs')

const util = require('./util')

const defaults = {
	'port': 3000,
	'rootURL': '/',
	'allowAccountCreation': false,
	'localDB': {
		'type': 'file',
		'options': {
			'filePath': 'dbAdapters/recipes.json'
		}
	},
	'security': {
		'saltRounds': 10
	}
}

exports.options = {}

exports.load = (configPath) => new Promise((resolve, reject) => {
	if (!fs.existsSync(configPath)) {
		// eslint-disable-next-line no-console
		console.log(configPath + ' does not exist. Exiting')
		process.exit(1)
	}

	fs.readFile(configPath, 'utf8', (err, contents) => {
		if (err) {
			reject(err)
			return
		}

		exports.options = util.fillMissingOpts(JSON.parse(contents), defaults)
		resolve(exports.options)
	})
})
