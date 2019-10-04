const util = require('./util')

exports.create = (data) => {
	if (!util.isString(data.name) || data.name.length < 1
		|| !util.isString(data.unit)
		|| util.validUnits.indexOf(data.unit) === -1
		|| isNaN(data.amount) || Number(data.amount) < 0) {
		return undefined
	}

	return {
		name: data.name,
		unit: data.unit,
		amount: Number(data.amount)
	}
}
