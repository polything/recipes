function submitRecipe() {
	const recipe = {}
	recipe.title = $('#title').val()
	recipe.ingredients = []

	$('#ingredients').find('li').each((idx, elem) => {
		const ingredient = {}
		ingredient.name = $(elem).find('.name').first().val()
		ingredient.amount = $(elem).find('.amount').first().val()
		ingredient.unit = $(elem).find('.unit').first().val()
		ingredient.prep = $(elem).find('.prep').first().val()
		ingredient.note = $(elem).find('.note').first().val()

		recipe.ingredients.push(ingredient)
	})

	recipe.directions =
		$('#directions').val().split('\n').filter(line => line !== '')

	console.log(recipe)

	const recipes = {'recipes': [recipe]}

	asyncPost('/data/add', recipes, (err, data) => {
		if (err) {
			console.log(err)
		} else {
			console.log('Data added')
		}
	})
}

function submitIngredient() {
	const ingredient = {}
	ingredient.name = $('#name').val()
	ingredient.amount = $('#amount').val()
	ingredient.unit = $('#unit').val()

	const url = DATA_URL + '/add/ingredient?name=' + ingredient.name
		+ '&amount=' + ingredient.amount
		+ '&unit=' + ingredient.unit

	console.log(ingredient)
	console.log(url)

	$.ajax({
		url: url,
		method: 'POST'
	})
}

function getID() {
	return ('' + Math.random()).slice(2)
}

function removeElement(id) {
	$('#' + id).remove()
}

function addIngredientInput() {
	const randID = 'ingredient-' + getID()
	const div = $('<div>')

	// Name
	const nameLabel = $('<label>Name</label>')
	$('<input type="text" class="name">').appendTo(nameLabel)
	div.append(nameLabel)

	// Amount
	const amountLabel = $('<label>Amount</label>')
	$('<input type="number" class="amount">').appendTo(amountLabel)
	div.append(amountLabel)

	// Unit
	const unitLabel = $('<label>Unit</label>')
	const unitSelect = $('<select class="unit">')
	const units = ['cup', 'floz', 'g', 'gal', 'kg', 'lb', 'liter', 'oz',
		'pint', 'quart', 'tbsp', 'tsp']

	units.map((unit) => {
		$('<option value="' + unit + '">' + unit + '</option>')
			.appendTo(unitSelect)
	})

	unitLabel.append(unitSelect)
	div.append(unitLabel)

	// Preparation
	const prepLabel = $('<label>Preparation</label>')
	$('<input type="text" class="prep">').appendTo(prepLabel)
	div.append(prepLabel)

	// Note
	const noteLabel = $('<label>Note</label>')
	$('<input type="text" class="note">').appendTo(noteLabel)
	div.append(noteLabel)

	// Remove button
	$('<button onclick="removeElement(\'' + randID + '\')">-</button>').appendTo(div)

	const li = $('<li>')
	li.attr('id', randID)
	li.append(div)
	$('#ingredients').append(li)
}

function initAddPage() {
	addIngredientInput()
}

$(document).ready(() => {
	initAddPage()
})
