// Publish 200 response.
// @param res{Object} The response object.
// @param data{Object} Data to send as JSON. Defaults to `{}`.
exports.send200 = (res, data={}) => {
	res.status(200).json(data).end()
}

// Publish 400 response with message.
// @param res{Object} The response object.
// @param msg{String} Message to send.
exports.send400 = (res, msg) => {
	res.status(400).json({msg: msg}).end()
}

// Publish 500 response with message
// @param res{Object} The response object.
// @param msg{String} Message to send.
exports.send500 = (res, msg) => {
	res.status(500).json({msg: msg}).end()
}

exports.getPantryItem = (req) => {
	return {
		_id: req.body._id,
		amount: Number(req.body.amount),
		name: req.body.name,
		unit: req.body.unit,
	}
}
