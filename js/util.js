exports.recipesEqual = (r1, r2) => {
	if (r1.title != r2.title) return false
	// TODO Check ingredients
	//else if (r1.ingredients != r2.ingredients) return false
}

exports.SearchOptions = function() {
	this.searchDirections = true
	this.searchIngredients = true
	this.searchTitle = true
}

exports.Recipe = function(title, ingredients, directions) {
	this.title = title
	this.ingredients = ingredients
	this.directions = directions
}

exports.Ingredient = function(name, amount, unit, preparation='', note='') {
	this.name = name
	this.amount = amount
	this.unit = unit
	this.preparation = preparation
	this.note = note
}

exports.validUnits = ['cup', 'floz', 'g', 'gal', 'kg', 'lb', 'liter', 'oz',
	'pint', 'quart', 'tbsp', 'tsp']

exports.isString = (thing) => {
	return typeof(thing) === 'string'
}

exports.hasOwnProps = (obj, props) => {
	return props.every(field => obj.hasOwnProperty(field))
}

exports.hasOwnProp = (obj, prop) => {
	return obj.hasOwnProperty(prop)
}

exports.isValidTitle = (recipe) => {
	return recipe.hasOwnProperty('title') && exports.isString(recipe.title)
		&& recipe.title.length > 2
}

exports.isValidIngredient = (ingredient) => {
	return typeof(ingredient) === 'object'
		&& exports.hasOwnProps(ingredient, ['name', 'amount', 'unit'])
		// name
		&& exports.isString(ingredient.name) && ingredient.name.length > 1
		// amount
		&& typeof(ingredient.amount) === 'number' && ingredient.amount > 0
		// unit
		&& exports.isString(ingredient.unit) && ingredient.unit in exports.validUnits
}

exports.isValidIngredients = (recipe) => {
	return recipe.ingredients.length > 0
		&& recipe.ingredients.every(exports.isValidIngredient)
}

exports.isValidDirection = (direction) => {
	return exports.isString(direction) && direction.length > 0
}

exports.isValidDirections = (recipe) => {
	return recipe.directions.length > 0
		&& recipe.directions.every(exports.isValidDirection)
}

exports.isValidRecipe = (recipe) => {
	const fields = ['ingredients', 'directions']
	return !(typeof(recipe) === 'object' && exports.isValidTitle(recipe)
		&& fields.every(field => recipe.hasOwnProperty(field))
		&& fields.every(field => Array.isArray(recipe[field]))
		&& exports.isValidIngredients(recipe)
		&& exports.isValidDirections(recipe))
}

const getTypeString = (obj) => Object.prototype.toString.call(obj).slice(8, -1)

exports.fillMissingOpts = (opts, defaults) => {
	if (opts === undefined || opts === null || getTypeString(opts) != 'Object') {
		return defaults
	}

	for (const key in defaults) {
		if (!(key in opts)) {
			opts[key] = defaults[key]
		} else if (getTypeString(opts[key]) == 'Object') {
			exports.fillMissingOpts(opts[key], defaults[key])
		}
	}
	return opts
}
