const express = require('express')
const router = express.Router()
const passport = require('passport')

const User = require('../models/User')

router.post('/', (req, res, next) => {
	passport.authenticate('local', (err, user, _) => {
		if (err) { return next(err) }
		if (!user) { return res.status(400).json({}).end() }

		req.logIn(user, async (err) => {
			if (err) { return next(err) }
			const data = await User
				.findOne({name: user.name}, 'name recipes')
				.populate('recipes', 'name').lean()

			return res.status(200).json(data).end()
		})
	})(req, res, next)
})

module.exports = router
