const mongoose = require('mongoose')

const recipeIngredientSchema = new mongoose.Schema({
	amount: {
		type: Number,
		required: (v) => !isNaN(v),
		min: 0.1,
		set: v => v.toFixed(1),
	},
	name: { type: String, required: true, minlength: 2, trim: true },
	note: { type: String, max: 20, min: 3, trim: true },
	prep: { type: String, max: 20, min: 3, trim: true },
	unit: {
		type: String,
		required: true,
		enum: ['cup', 'floz', 'g', 'gal', 'kg', 'lb', 'liter', 'oz', 'pint',
			'quart', 'tbsp', 'tsp'],
	},
})

const recipeSchema = new mongoose.Schema({
	dateAdded: { type: Date, default: Date.now },
	directions: [{ type: String, trim: true, minlength: 3 }],
	ingredients: [recipeIngredientSchema],
	name: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
		maxlength: 50,
		minlength: 3,
	},
})

const Recipe = mongoose.model('Recipe', recipeSchema)

module.exports = Recipe
