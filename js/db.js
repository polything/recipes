const Recipe = require('../models/Recipe')
const User = require('../models/User')

// Create a new user and return an error if creating the user failed.
exports.createUser = async (username, password) => {
	return new Promise((resolve, _) => {
		User.create({name: username, password: password}, (err, _) => {
			resolve(err)
		})
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
