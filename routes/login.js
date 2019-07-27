const express = require('express')
const router = express.Router()
const path = require('path')
const pug = require('pug')

const passport = require('passport')
const db = require('../js/localDB')

router.post('/', passport.authenticate('local'), function(req, res) {
	db.findUser(req.body.username)
		.then(userInfo => {
			const data = {
				username: userInfo.username
			}
			res.status(200).json(data)
		})
})

module.exports = router
