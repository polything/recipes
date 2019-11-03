const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const pantryItemSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: (v) => !isNaN(v),
		min: 0,
		set: v => v.toFixed(2),
	},
	dateAdded: { type: Date, default: Date.now },
	name: { type: String, required: true, minlength: 2, trim: true },
	unit: {
		type: String,
		required: true,
		enum: ['cup', 'floz', 'g', 'gal', 'kg', 'lb', 'liter', 'oz', 'pint',
			'quart', 'tbsp', 'tsp'],
	},
})


const userSchema = new mongoose.Schema({
	dateAdded: { type: Date, default: Date.now },
	name: { type: String, unique: true, },
	password: { type: String, required: true },
	recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', }],
	pantry: [pantryItemSchema]
})


// Password hash middleware.
// @param next{function} Next middleware to call.
userSchema.pre('save', function(next) {
	const user = this
	if (!user.isModified('password')) { return next() }

	bcrypt.genSalt(10, (err, salt) => {
		if (err) { return next(err) }
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) { return next(err) }
			user.password = hash
			next()
		})
	})
})


// Validate password.
// @param candidatePassword{String} Password to verify.
// @param cb{function} Callback function
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch)
	})
}

const User = mongoose.model('User', userSchema)

module.exports = User
