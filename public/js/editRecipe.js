function editRecipe(recipe) {
	switchPage('edit-recipe')
	$('#navbar').addClass('d-none')

	formatRecipeEdit(recipe)
}

function formatRecipeEdit(recipe) {
	$('#recipe-form-name').val(recipe.title)

	$('#recipe-form-ingredients').html('')
	recipe.ingredients.forEach(ingredient => {
		addFormIngredient(ingredient)
	})

	$('#recipe-form-directions').val(recipe.directions.join('\n\n'))
}

function backToRecipeView() {
	switchPage('home')
	$('#navbar').removeClass('d-none')
}

function saveRecipeEdit() {
	backToRecipeView()

	saveRecipe(DATA_URL + '/recipe/edit')
}
