const bcrypt = require('bcrypt')
const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')

const db = require('../js/localDB')

passport.serializeUser((user, done) => {
	done(null, user.username)
})

passport.deserializeUser(async (username, done) => {
	const {err, user} = await db.findUser(username, done)
	return done(err, user)
})

// Sign in using username and password
passport.use(new LocalStrategy(async (username, password, done) => {
	const {err, user} = await db.findUser(username)
	if (err) return done(err)
	if (!user) return done(null, false)

	bcrypt.compare(password, user.password, (err, isValid) => {
		if (err) return done(err)
		if (!isValid) return done(null, false)

		return done(null, user)
	})
}))

// Login required middleware
exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) { return next() }
	return res.status(400).end()
}
