const Recipe = require('../models/Recipe')
const User = require('../models/User')

exports.createUser = async (username, password) => {
	const user = new User({
		name: username,
		password: password,
	})

	return new Promise((resolve, _) => {
		user.save((err) => { resolve(err) })
	})
}

exports.deleteUser = async (username) => {
	return await User.findOneAndDelete({ name: username }) ? true : false
}

exports.getAllUsers = async () => {
	return await User.find({}, 'name').lean()
}

exports.getUser = async (username) => {
	return await User
		.findOne({name: username}, 'name recipes pantry')
		.populate('recipes', 'name').lean()
}

exports.usernameExists = async (username) => {
	return await User.findOne({ name: username }) ? true : false
}
