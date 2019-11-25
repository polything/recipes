/* eslint-env browser, jquery */
/* global app, DATA_URL */

(() => {
	let defaultRecipes = []
	let user = {}

	// currentRecipe is used in parseRecipe(3)
	let currentRecipe = {}

	// Send an AJAX request with the correct settings to enable the server to
	// parser the body as JSON.
	// @param method{String} The HTTP method to use.
	// @param data{Anything} A JSON value (Object, Array, number, etc.).
	// @param url{String} The URL to send to.
	// @param onSuccess{function} The success callback.
	// @param onErr{function} The error callback.
	const sendAjax = (method, data, url, onSuccess, onErr) => {
		$.ajax({
			contentType: 'application/json',
			data: data ? JSON.stringify(data) : undefined,
			dataType: 'json',
			error: onErr,
			method: method,
			success: onSuccess,
			url: url,
		})
	}

	// Show invalid formatting and help text of a form input.
	// @param id{String} HTML ID selector of the input field.
	const showFormInvalid = (id) => {
		$(id).addClass('is-invalid')
		$(`${id}-help`).removeClass('d-none')
	}

	// Hide invalid formatting and help text of a form input.
	// @param id{String} HTML ID selector of the input field.
	const hideFormInvalid = (id) => {
		$(id).removeClass('is-invalid')
		$(`${id}-help`).addClass('d-none')
	}

	// Create an ingredient input with a unique ID from the ingredient input
	// template. The unique ID is assigned to the top div's id attribute.
	//
	// @return A JQuery element.
	const createIngredientInput = () => {
		const $ret = $('#template-ingredient-input').clone()
		const id = getID()
		$ret.attr('id', id)
		$ret.find('button').click(() => removeElement(id))

		$ret.find('#form-ingredient-name')
			.attr('id', `${id}-form-ingredient-name`)

		$ret.find('#form-ingredient-name-help')
			.attr('id', `${id}-form-ingredient-name-help`)

		$ret.find('#form-ingredient-amount')
			.attr('id', `${id}-form-ingredient-amount`)

		$ret.find('#form-ingredient-amount-help')
			.attr('id', `${id}-form-ingredient-amount-help`)

		return $ret
	}

	const addFormIngredient = (ingredient) => {
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


	const editRecipe = () => {
		switchPage('edit-recipe')
		$('#navbar').addClass('d-none')

		$('#recipe-form-name').val(currentRecipe.name)
		$('#recipe-form-name').attr('recipe-id', currentRecipe._id)

		$('#recipe-form-ingredients').html('')
		currentRecipe.ingredients.forEach(ingredient => {
			addFormIngredient(ingredient)
		})

		$('#recipe-form-directions').val(currentRecipe.directions.join('\n\n'))
	}

	const backToRecipePage = () => {
		switchPage('my-recipes')
		$('#navbar').removeClass('d-none')
	}

	const onRecipeDeleteClick = (id) => {
		$(`#${id}-confirm`).removeClass('d-none')
		// Remove existing click events so they don't stack
		$(`#${id}-delete`).off()
		$(`#${id}-delete`).click(() => onRecipeDeleteCancelClick(id))
	}

	const onRecipeDeleteCancelClick = (id) => {
		$(`#${id}-confirm`).addClass('d-none')
		// Remove existing click events so they don't stack
		$(`#${id}-delete`).off()
		$(`#${id}-delete`).click(() => onRecipeDeleteClick(id))
	}

	const getID = () => {
		return ('' + Math.random()).slice(2)
	}

	const removeElement = (id) => {
		$('#' + id).remove()
	}

	// Create an ingredient input element and append it to the ingredient list
	// prefixed by `formType`.
	//
	// @param formType{String} The unique prefix for ingredient list. Used to
	// 					 differentiate between edit and add ingredient form
	// 					 lists.
	// @param ingredient{Object} Ingredient object to prefill ingredient input
	// 							 inputs.
	const addIngredientInput = (formType, ingredient) => {
		const $elem = createIngredientInput()
		if (ingredient) {
			$elem.find('.name').val(ingredient.name)
			$elem.find('.amount').val(ingredient.amount)
			$elem.find('.unit').val(ingredient.unit)
			$elem.find('.prep').val(ingredient.prep)
			$elem.find('.note').val(ingredient.note)
		}

		$(`#${formType}-form-ingredients`).append($elem)
	}

	const initAddPage = () => {
		addIngredientInput('recipe-add')
	}

	const switchProfilePrompt = (name) => {
		$('.page-profile-prompt').addClass('d-none')
		$('#profile-prompt-' + name).removeClass('d-none')
		$('.profile-nav').removeClass('active')
		$('#profile-prompt-navbar-' + name).addClass('active')
	}

	const onError = (_, statusStr, errStr) => {
		// eslint-disable-next-line no-console
		console.log(statusStr)
		// eslint-disable-next-line no-console
		console.log(errStr)
	}

	// Refresh the home and profile recipe lists.
	const onDeleteRecipeSuccess = (_, _2, _3) => {
		initRecipes()
		initProfile()
	}

	// Create a recipe item for the profile page.
	// @param name{String} Name of the recipe.
	// @param id{Sting} ID ofthe recipe.
	// @return {jQuery element} The recipe element.
	const createProfileRecipe = (name, id) => {
		const $ret = $('#template-profile-recipe').clone()
		$ret.removeClass('d-none')

		$ret.attr('id', id)

		const $buttons = $ret.find('button')
		const $deleteBtn = $buttons[0]
		const $confirmBtn = $buttons[1]
		$($deleteBtn).attr('id', `${id}-delete`)
		$($confirmBtn).attr('id', `${id}-confirm`)

		// Delete the recipe on confirm
		$($confirmBtn).click(() => {
			const url = `${DATA_URL}/recipe/${id}`
			sendAjax('DELETE', {}, url, onDeleteRecipeSuccess, onError)
		})

		// Show the confirm button when clicked
		$($deleteBtn).click(() => onRecipeDeleteClick(id))

		const $link = $ret.find('a')
		$link.click(() => showRecipePage(id, true, 'my-recipes'))
		$link.html(name)

		return $ret
	}


	const switchProfile = (name) => {
		$('.page-profile').addClass('d-none')
		$('#profile-' + name).removeClass('d-none')
	}

	const onLoginSuccess = (data, _, _2) => {
		updateProfile(data)
		switchProfile('view')
		$('#navbar-pantry').removeClass('d-none')
		$('#navbar-my-recipes').removeClass('d-none')
	}

	const login = () => {
		$.ajax({
			data: {
				'username': $('#login-form-name').val(),
				'password': $('#login-form-pass').val(),
			},
			error: onError,
			method: 'POST',
			success: onLoginSuccess,
			url: '/login',
		})
	}

	const onLogoutSuccess = (data, _, _2) => {
		updateProfile(data)
		$('#navbar-pantry').addClass('d-none')
		$('#navbar-my-recipes').addClass('d-none')
		switchProfile('prompt')
		filterPantryList('')
	}

	const logout = () => {
		$.ajax({
			error: onError,
			method: 'GET',
			success: onLogoutSuccess,
			url: DATA_URL + '/profile/logout'
		})
	}

	const onCreateAccountSuccess = (data, _, _2) => {
		onLoginSuccess(data)
	}

	const createAccount = () => {
		const url = `${DATA_URL}/profile/create`
		const data = {
			'username': $('#create-form-name').val(),
			'password': $('#create-form-pass').val()
		}

		sendAjax('POST', data, url, onCreateAccountSuccess)
	}

	const parseRecipe = (data, _, _2) => {
		currentRecipe = data
		formatRecipeView(data)
	}

	const getRecipe = (id) => {
		$.ajax({
			method: 'GET',
			success: parseRecipe,
			url: `${DATA_URL}/recipe/${id}`,
		})
	}

	const showRecipePage = (id, showEditBtn, returnPage) => {
		getRecipe(id)
		if (showEditBtn) { $('#recipe-edit-btn').removeClass('d-none') }
		else { $('#recipe-edit-btn').addClass('d-none') }

		// Remove existing click events so they don't stack
		$('#recipe-back-btn').off()

		// Set back button behavior to return to specified page
		$('#recipe-back-btn').click(() => {
			$('#navbar').removeClass('d-none')
			switchPage(returnPage)
			formatRecipeView({
				name: 'Loading recipe...',
				ingredients: [],
				directions: [],
			})
		})
		$('#navbar').addClass('d-none')
		switchPage('recipe')
	}

	const formatRecipeView = (recipe) => {
		$('#recipe-name').html(recipe.name)

		// Ingredients
		$('#recipe-ingredients').html('') // Clear contents
		recipe.ingredients.forEach(ingredient => {
			const prep = ingredient.prep !== null ? ', ' + ingredient.prep : ''
			const note = ingredient.note !== null ? ' (' + ingredient.note + ')' : ''
			const str = ingredient.amount + ' ' + ingredient.unit + ' '
				+ ingredient.name + prep + note

			const $elem = $('<li></li>')
			$elem.html(str)
			$('#recipe-ingredients').append($elem)
		})

		// Directions
		$('#recipe-directions').html('') // Clear contents
		recipe.directions.forEach(direction => {
			const $elem = $('<p></p>')
			$elem.html(direction)
			$('#recipe-directions').append($elem)
		})
	}

	const switchPage = (page) => {
		$('.page').addClass('d-none')
		$('#page-' + page).removeClass('d-none')
		$('.main-nav').removeClass('active')
		$('#navbar-' + page).toggleClass('active')
	}

	// Callback for GET create allowed request.
	const onGetCreateAllowedSuccess = (data, _, _2) => {
		if (!data.allowed) {
			$('#profile-prompt-navbar-create').addClass('d-none')
			const $login = $('#profile-prompt-navbar-login')
			$login.removeClass('active nav-link')
			$login.removeAttr('onclick href')
		}
	}

	const initRecipes = () => {
		const term = 'a'
		defaultRecipes = []
		searchForRecipes(term)
	}

	// PANTRY ADD VIEW =========================================================

	// Hide the pantry add page and show the pantry page.
	const hidePantryAddPage = () => {
		$('#navbar').removeClass('d-none')
		switchPage('pantry')
	}

	// Hide the pantry page and show the pantry add page.
	const showPantryAddPage = () => {
		$('#navbar').addClass('d-none')
		switchPage('pantry-add')
	}

	// PANTRY ADD ==============================================================

	const onPantryAddSuccess = (_, _2, _3) => {
		getPantry()
	}

	const submitIngredient = () => {
		const ingredient = {}
		ingredient.name = $('#ingredient-name').val()
		ingredient.amount = $('#ingredient-amount').val()
		ingredient.unit = $('#ingredient-unit').val()

		const url = DATA_URL + '/pantry?name=' + ingredient.name
			+ '&amount=' + ingredient.amount
			+ '&unit=' + ingredient.unit

		sendAjax('POST', {}, url, onPantryAddSuccess)
	}

	// PANTRY VIEW =============================================================

	// Update the pantry item list to items whose names match the term.
	// @param term{String} The term to filter on.
	const filterPantryList = (term) => {
		const $list = $('#pantry-item-list')
		$list.html('') // Clear contents

		for (const key in user.pantry) {
			const ingredient = user.pantry[key]

			// Filter out the ingredient if term is given and term is not a
			// substring of ingredient name
			if (term !== '' && ingredient.name.indexOf(term) === -1) {
				continue
			}

			// Clone template row
			const $item = $('#template-pantry-item').clone()
			$item.removeClass('d-none')

			const $cols = $item.find('div')
			const $name = $($cols[0])
			const $amount = $($cols[1])
			const $unit = $($cols[2])

			$name.html(ingredient.name)
			$amount.html(ingredient.amount)
			$unit.html(ingredient.unit)
			$('#pantry-item-list').append($item)
		}
	}

	// Request the user's pantry
	const getPantry = () => {
		sendAjax('GET', null, DATA_URL + '/pantry', onGetPantrySuccess)
	}

	// Update the pantry item list with the received pantry items.
	const onGetPantrySuccess = (data, _, _2) => {
		user.pantry = data
		filterPantryList('')
	}

	// RECIPE ==================================================================

	// Get the contents of the recipe form.
	// @return{Object} Recipe.
	const getRecipeFormContent = () => {
		const recipe = {}
		recipe._id = $('#recipe-form-name').attr('recipe-id')
		recipe.name = $('#recipe-form-name').val()
		recipe.ingredients = []

		$('#recipe-form-ingredients').find('li').each((idx, elem) => {
			const ingredient = {}
			ingredient.name = $(elem).find('.name').first().val()
			ingredient.amount = Number($(elem).find('.amount').first().val())
			ingredient.unit = $(elem).find('.unit').first().val()
			ingredient.prep = $(elem).find('.prep').first().val()
			ingredient.note = $(elem).find('.note').first().val()

			recipe.ingredients.push(ingredient)
		})

		recipe.directions =
			$('#recipe-form-directions').val().split('\n')
				.filter(line => line !== '')

		return recipe
	}


	const getRecipes = async () => {
		return await $.ajax({
			dataType: 'json',
			method: 'GET',
			url: `${DATA_URL}/profile/recipes`,
		})
	}


	// RECIPE ADD ==============================================================

	const addRecipe = () => {
		if (!validateRecipeForm('recipe-add')) {
			return
		}

		const recipe = {}
		recipe.name = $('#recipe-add-form-name').val()
		recipe.ingredients = []

		$('#recipe-add-form-ingredients').find('.ingredient').each((idx, elem) => {
			const ingredient = {}
			ingredient.name = $(elem).find('.name').first().val()
			ingredient.amount = $(elem).find('.amount').first().val()
			ingredient.unit = $(elem).find('.unit').first().val()
			ingredient.prep = $(elem).find('.prep').first().val()
			ingredient.note = $(elem).find('.note').first().val()

			recipe.ingredients.push(ingredient)
		})

		recipe.directions =
			$('#recipe-add-form-directions').val().split('\n')
				.filter((line) => line !== '')

		sendAjax('POST', recipe, `${DATA_URL}/recipe`, onRecipeAddSuccess,
			onRecipeAddError)
	}

	// Reset the add recipe form
	const addRecipeFormReset = () => {
		resetRecipeAddInvalidForms()
		$('#recipe-add-form-name').val('')
		$('#recipe-add-form-ingredients').html('')
		addIngredientInput('recipe-add')
		$('#recipe-add-form-directions').val('')
		$('#recipe-add-btn').text('Save')
		$('#recipe-add-btn').addClass('btn-light')
		$('#recipe-add-btn').removeClass('btn-success')
	}

	// Hide the page where the user can add a recipe to their profile and show
	// the "My Recipes" page.
	const hideRecipeAddPage = () => {
		switchPage('my-recipes')
		$('#navbar').removeClass('d-none')
	}

	const onRecipeAddError = (data, _, _2) => {
		resetRecipeAddInvalidForms()
		const errs = data.responseJSON
		if (errs.includes('name-exists')) {
			showFormInvalid('#recipe-add-form-name')
		}
	}

	const onRecipeAddSuccess = () => {
		$('#recipe-add-btn').text('Saved!')
		$('#recipe-add-btn').addClass('btn-success')
		$('#recipe-add-btn').removeClass('btn-light')
		initRecipes()
		initProfile()
	}

	// Reset all input formatting for invalid values
	const resetRecipeAddInvalidForms = () => {
		hideFormInvalid('#recipe-add-form-name')
		hideFormInvalid('#recipe-add-form-directions')
	}

	// Show the page where the user can add a recipe to their profile and hide
	// the "My Recipes" page.
	const showRecipeAddPage = () => {
		switchPage('recipe-add')
		$('#navbar').addClass('d-none')
	}

	// Validate the recipe form and highlight elements that fail validation.
	// @return true if valid; false otherwise.
	const validateRecipeForm = (formType) => {
		let valid = true
		let id = `#${formType}-form-name`
		if ($(id).val() === '') {
			showFormInvalid(id)
			valid = false
		}

		const checkField = (elem, className) => {
			const $elem = $(elem).find(className).first()
			if ($elem.val() === '') {
				showFormInvalid(`#${$elem.attr('id')}`)
				valid = false
			}
		}

		// Check empty fields for all ingredients
		$(`#${formType}-form-ingredients`).find('.ingredient').each((_, elem) => {
			checkField(elem, '.name')
			checkField(elem, '.amount')
		})

		id = `#${formType}-form-directions`
		if ($(id).val() === '') {
			showFormInvalid(id)
			valid = false
		}

		return valid
	}


	// RECIPE EDIT =============================================================


	// Update user recipes and search results.
	const onRecipeEditSuccess = async () => {
		user.recipes = await getRecipes()
		updateProfileRecipes(user.recipes)
		initRecipes()
	}


	// Request save of recipe edit and return to user recipes page
	const saveRecipeEdit = () => {
		backToRecipePage()
		const recipe = getRecipeFormContent()
		sendAjax('POST', recipe, `${DATA_URL}/recipe/edit`, onRecipeEditSuccess)
	}


	// RECIPE SEARCH ===========================================================


	const onRecipeSearch = (term) => {
		term = term.trim()
		term = term.replace(/\s+/gi, ' ')
		if (term === '') {
			updateRecipeList(defaultRecipes)
		} else {
			searchForRecipes(term)
		}
	}

	// Update the internal list of search results if not already set and update
	// the search results.
	const onRecipeSearchSuccess = (recipes, _, _2) => {
		if (defaultRecipes.length < 1) {
			defaultRecipes = recipes
		}
		updateRecipeList(recipes)
	}

	const search = (event, elem, callback) => {
		callback(elem.value)
	}

	const searchForRecipes = (term) => {
		term = encodeURIComponent(term)
		sendAjax('GET', null, `${DATA_URL}/recipe?t=${term}`,
			onRecipeSearchSuccess)
	}

	const updateRecipeList = (recipes) => {
		$('#searchResults').html('') // Clear contents
		recipes.forEach((recipe) => {
			const $item = $('#template-search-result').clone()
			$item.removeClass('d-none')

			const id = getID()
			$item.attr('id', id)

			const $link = $item.find('a')
			$link.click(() => showRecipePage(recipe._id, false, 'home'))
			$link.html(recipe.name)
			$('#searchResults').append($item)
		})
	}

	// PROFILE =================================================================

	// Initialize profile page
	const initProfile = () => {
		sendAjax('GET', null, DATA_URL + '/profile/createAllowed',
			onGetCreateAllowedSuccess)

		sendAjax('GET', null, DATA_URL + '/profile', onLoginSuccess)
	}

	const onChangePassSuccess = () =>{
		$('#change-pass-submit-btn').addClass('btn-success')
		$('#change-pass-submit-btn').removeClass('btn-outline-light')
		$('#change-pass-submit-btn').html('Success')

		setTimeout(resetChangePassForm, 5000)
	}

	const resetChangePassForm = () => {
		$('#change-pass-form').trigger('reset')
		$('#change-pass-submit-btn').removeClass('btn-success')
		$('#change-pass-submit-btn').addClass('btn-outline-light')
		$('#change-pass-submit-btn').html('Change')
		resetChangePassFormValid()
	}

	const resetChangePassFormValid = () => {
		hideFormInvalid('#change-pass-2')
	}

	const submitChangePass = () => {
		resetChangePassFormValid()

		const first = $('#change-pass-1').val()
		const second = $('#change-pass-2').val()
		if (first !== second) {
			showFormInvalid('#change-pass-2')
			return
		}

		const data = { newPass: second }
		sendAjax('POST', data, DATA_URL + '/profile/change', onChangePassSuccess)
	}

	const showChangePass = () => {
		$('#change-pass-form').removeClass('d-none')
		$('#change-pass-btn').addClass('d-none')
	}

	const hideChangePass = () => {
		$('#change-pass-form').addClass('d-none')
		$('#change-pass-btn').removeClass('d-none')
		resetChangePassForm()
	}

	// Hide the delete account button and show the confirm delete account
	// buttons.
	const confirmDeleteAccount = () => {
		$('#profile-delete-btn').addClass('d-none')
		$('#profile-delete-confirm-btns').removeClass('d-none')
	}

	// Hide the confirm delete account buttons and show the delete account
	// button.
	const resetDeleteAccount = () => {
		$('#profile-delete-btn').removeClass('d-none')
		$('#profile-delete-confirm-btns').addClass('d-none')
	}

	// When currently logged in user is deleted on the server, reset the confirm
	// display and logout the user session.
	const onDeleteAccountSuccess = () => {
		resetDeleteAccount()
		onLogoutSuccess({})
	}

	// Submit request to delete currently logged in user.
	const deleteAccount = () => {
		sendAjax('DELETE', {}, DATA_URL + '/profile', onDeleteAccountSuccess)
	}


	// Update recipes listed for the profile.
	// @param {Object} Array of recipes.
	const updateProfileRecipes = (recipes) => {
		$('#profile-recipe-list').html('')
		recipes.forEach((recipe) => {
			$('#profile-recipe-list').append(
				createProfileRecipe(recipe.name, recipe._id))
		})
	}


	// Update information displayed on profile with given information.
	// @param data{Object} The new user information.
	const updateProfile = (data) => {
		// Update local user data
		user = data
		$('#profile-name').text(data.name ? data.name : '')
		if (data.recipes) { updateProfileRecipes(data.recipes) }
		filterPantryList('')
	}


	// EXPORT ==================================================================

	const constructor = () => {
		// The recipe module to return
		const widget = {}

		widget.addFormIngredient = addFormIngredient
		widget.addIngredientInput = addIngredientInput
		widget.addRecipe = addRecipe
		widget.addRecipeFormReset = addRecipeFormReset
		widget.backToRecipePage = backToRecipePage
		widget.confirmDeleteAccount = confirmDeleteAccount
		widget.createAccount = createAccount
		widget.deleteAccount = deleteAccount
		widget.editRecipe = editRecipe
		widget.filterPantryList = filterPantryList
		widget.hideRecipeAddPage = hideRecipeAddPage
		widget.hideChangePass = hideChangePass
		widget.hidePantryAddPage = hidePantryAddPage
		widget.initAddPage = initAddPage
		widget.initProfile = initProfile
		widget.initRecipes = initRecipes
		widget.login = login
		widget.logout = logout
		widget.onRecipeSearch = onRecipeSearch
		widget.resetDeleteAccount = resetDeleteAccount
		widget.saveRecipeEdit = saveRecipeEdit
		widget.search = search
		widget.showRecipeAddPage = showRecipeAddPage
		widget.showChangePass = showChangePass
		widget.showPantryAddPage = showPantryAddPage
		widget.submitChangePass = submitChangePass
		widget.submitIngredient = submitIngredient
		widget.switchPage = switchPage
		widget.switchProfilePrompt = switchProfilePrompt

		return widget
	}

	window['app'] = constructor()
})()

$(() => {
	app.initAddPage()
	app.initRecipes()
	app.initProfile()
})
