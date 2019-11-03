const express = require('express')
const router = express.Router()

const passport = require('passport')

router.post('/', passport.authenticate('local'), (req, res, next) => {
	passport.authenticate('local', (err, user, _) => {
		if (err) { return next(err) }
		if (!user) {
			return res.status(400).json({}).end()
		}
		req.logIn(user, (err) => {
			if (err) { return next(err) }
			return res.status(200).json({ username: user.name }).end()
		})
	})(req, res, next)
})

module.exports = router
