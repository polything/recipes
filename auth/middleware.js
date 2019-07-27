function authMiddleware() {
	return (req, res, next) => {
		if (req.isAuthenticated()) return next()

		res.json({})
	}
}

module.exports = authMiddleware
