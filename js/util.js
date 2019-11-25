// Publish 400 response with message
exports.send400 = (res, msg) => {
	res.status(400).json({msg: msg}).end()
}
