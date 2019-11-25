const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../models/User')

const util = require('../js/util')

router.post('/', (req, res, next) => {
	passport.authenticate('local', (err, user, _) => {
		if (err) { return next(err) }
		if (!user) { return util.send400(res, 'Invalid username or password') }

		req.logIn(user, async (err) => {
			if (err) { return next(err) }
			const data = await User
				.findById(user._id, 'name recipes pantry')
				.populate('recipes', 'name').lean()

			return res.status(200).json(data).end()
		})
	})(req, res, next)
})

module.exports = router
