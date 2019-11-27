// Publish 400 response with message
exports.send400 = (res, msg) => {
	res.status(400).json({msg: msg}).end()
}

exports.getPantryItem = (req) => {
	return {
		_id: req.body._id,
		amount: Number(req.body.amount),
		name: req.body.name,
		unit: req.body.unit,
	}
}
