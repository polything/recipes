const bcrypt = require('bcrypt')
const Promise = require('promise')

const config = require('../js/config')

function hash(pass) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(pass, config.options.security.saltRounds, (err, hash) => {
			if (err) { reject(err) }

			resolve(hash)
		})
	})
}

module.exports = {
	'hash': hash
}
