const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')

const User = require('../models/User')

passport.serializeUser((user, done) => {
	done(null, user.name)
})

passport.deserializeUser((name, done) => {
	User.findOne({name: name}, (err, user) => {
		done(err, user)
	})
})

// Sign in using username and password
passport.use(new LocalStrategy(async (name, password, done) => {
	const user = await User.findOne({ name: name })
	if (!user) { return done(null, false, {msg: `User ${name} not found` }) }

	user.comparePassword(password, (err, isMatch) => {
		if (err) { return done(err) }
		if (isMatch) { return done(null, user) }

		return done(null, false, { msg: 'Invalid name or password' })
	})
}))

// Login required middleware
exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) { return next() }
	return res.status(401).end()
}
