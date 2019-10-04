const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

const authMiddleware = require('./middleware')
const localDB = require('../js/localDB')

function findUser(username, done) {
	localDB.findUser(username)
		.then(user => {
			if (user !== undefined) {
				return done(null, user)
			}

			return done(null)
		})
		.catch(msg => {
			// eslint-disable-next-line no-console
			console.log(msg)
			done(null)
		})
}

passport.serializeUser((user, done) => {
	done(null, user.username)
})

passport.deserializeUser((username, done) => {
	findUser(username, done)
})

function initPassport() {
	passport.use(new LocalStrategy((username, password, done) => {
		findUser(username, (err, user) => {
			if (err) return done(err)

			if (!user) return done(null, false)

			bcrypt.compare(password, user.password, (err, isValid) => {
				if (err) return done(err)

				if (!isValid) return done(null, false)

				return done(null, user)
			})
		})
	}))

	passport.authenticationMiddleware = authMiddleware
}

module.exports = initPassport
