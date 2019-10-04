/* eslint-env browser, jquery */
/* global getID, removeElement */

function createIngredientInput() {
	const $ret = $('#template-ingredient-input').clone()
	const id = getID()
	$ret.attr('id', id)
	$ret.find('button').click(() => removeElement(id))
	return $ret
}

// eslint-disable-next-line no-unused-vars
function addFormIngredient(ingredient) {
	const $elem = createIngredientInput()
	const id = $elem.attr('id')
	if (ingredient) {
		$elem.find('.name').val(ingredient.name)
		$elem.find('.amount').val(ingredient.amount)
		$elem.find('.unit').val(ingredient.unit)
		$elem.find('.prep').val(ingredient.prep)
		$elem.find('.note').val(ingredient.note)
	}
	const $li = $('<li></li>').append($elem)
	$li.attr('id', id)
	$('#recipe-form-ingredients').append($li)
}

// eslint-disable-next-line no-unused-vars
function saveRecipe(url) {
	const recipe = {}
	recipe.title = $('#recipe-form-name').val()
	recipe.ingredients = []

	$('#recipe-form-ingredients').find('li').each((idx, elem) => {
		const ingredient = {}
		ingredient.name = $(elem).find('.name').first().val()
		ingredient.amount = $(elem).find('.amount').first().val()
		ingredient.unit = $(elem).find('.unit').first().val()
		ingredient.prep = $(elem).find('.prep').first().val()
		ingredient.note = $(elem).find('.note').first().val()

		recipe.ingredients.push(ingredient)
	})

	recipe.directions =
		$('#recipe-form-directions').val().split('\n').filter(line => line !== '')

	const recipes = {'recipes': [recipe]}

	$.ajax({
		data: recipes,
		method: 'POST',
		url: url,
	})
}

