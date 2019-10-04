const readline = require('readline')

const config = require('./config')

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

function getInfo() {
	const db = require('../dbAdapters/file')
	rl.question('username: ', (name) => {
		rl.question('password: ', (pass) => {
			const user = {
				'username': name,
				'password': pass,
			}

			db.addUser(user)
				// eslint-disable-next-line no-console
				.then(success => console.log(success ? 'Added. Restart the server' : 'Failed'))

				// eslint-disable-next-line no-console
				.catch(err => console.log(err))

			rl.close()
		})
	})
}

rl.question('config file path: ', (path) => {
	config.load(path)
		.then(_ => {
			getInfo()
		})
		// eslint-disable-next-line no-console
		.catch(err => console.log(err))
})
