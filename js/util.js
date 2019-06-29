const http = require('http')

// $1 = domain
// $2 = port
// $3 = path
const urlRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})((?::\d+)?)(.*)/

// Send a POST and return a Promise resolving the response
exports.asyncPost = (url, body) => new Promise((resolve, reject) => {
	let matches = url.match(urlRegex)
	if (matches === null) {
		reject()
	}

	let host = matches[1]
	let port = matches[2]
	port = port.length > 1 ? port.substr(1) : '443'
	let path = matches[3]

	let req = http.request({
		agent: false,
		headers: {
			'Content-Type': 'application/json'
		},
		hostname: host,
		method: 'POST',
		path: path,
		port: port
	}, (res) => {
		let buffer = Buffer.from([])
		res.on('data', (chunk) => {
			buffer = Buffer.concat([buffer, chunk])
		})
		res.on('end', () => {
			let results = {}
			try {
				results = JSON.parse(buffer.toString())
			} catch (e) {
				if (e instanceof SyntaxError) {
					// Ignore syntax errors
				}
			}
			resolve(results)
		})
	})

	req.on('error', (e) => {
		reject(e)
	})

	req.write(body)
	req.end()
})

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
	let fields = ['ingredients', 'directions']
	return !(typeof(recipe) === 'object' && exports.isValidTitle(recipe)
		&& fields.every(field => recipe.hasOwnProperty(field))
		&& fields.every(field => Array.isArray(recipe[field]))
		&& exports.isValidIngredients(recipe)
		&& exports.isValidDirections(recipe))
}
