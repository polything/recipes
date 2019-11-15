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
			data: JSON.stringify(data),
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

	const sendRecipeRequest = (term, opts) => {
		const body = JSON.stringify({
			'options': opts,
			'term': term,
		})

		return $.ajax({
			method: 'POST',
			contentType: 'application/json',
			processData: false,
			dataType: 'json',
			url: DATA_URL,
			data: body,
		})
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
		return $ret
	}

	// eslint-disable-next-line no-unused-vars
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

	const saveRecipe = (url) => {
		const recipe = {}
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
			$('#recipe-form-directions').val().split('\n').filter(line => line !== '')

		sendAjax('POST', recipe, url)
	}

	const editRecipe = () => {
		switchPage('edit-recipe')
		$('#navbar').addClass('d-none')

		$('#recipe-form-name').val(currentRecipe.name)

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

	const saveRecipeEdit = () => {
		backToRecipePage()
		saveRecipe(`${DATA_URL}/recipe/edit`)
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

	const createSearchResult = (name) => {
		const $ret = $('#template-search-result').clone()
		$ret.removeClass('d-none')

		const id = getID()
		$ret.attr('id', id)

		const $link = $ret.find('a')
		$link.click(() => showRecipePage(name, false, 'home'))
		$link.html(name)

		return $ret
	}

	const updateRecipeList = (recipes) => {
		$('#searchResults').html('') // Clear contents
		recipes.forEach((recipe) => {
			$('#searchResults').append(createSearchResult(recipe.name))
		})
	}

	const searchForRecipes = (term, opts) => {
		sendRecipeRequest(term, opts)
			.done((recipes, _, _2) => {
				if (defaultRecipes.length < 1) {
					defaultRecipes = recipes
				}
				updateRecipeList(recipes)
			})
			.fail((_, _2, err) => {
				// eslint-disable-next-line no-console
				console.log(err)
			})
	}

	const onRecipeSearch = (term) => {
		if (term === '') {
			updateRecipeList(defaultRecipes)
		} else {
			const opts = {'ingredients': true, 'name': true}
			searchForRecipes(term, opts)
		}
	}

	const search = (event, elem, callback) => {
		callback(elem.value)
	}

	// Reset all input formatting for invalid values
	const resetAddRecipeInvalidForms = () => {
		hideFormInvalid('#add-recipe-form-name')
	}

	// Reset the add recipe form
	const addRecipeFormReset = () => {
		resetAddRecipeInvalidForms()
		$('#add-recipe-form-name').val('')
		$('#add-recipe-form-ingredients').html('')
		addIngredientInput('add-recipe')
		$('#add-recipe-form-directions').val('')
		$('#add-recipe-btn').text('Save')
		$('#add-recipe-btn').addClass('btn-light')
		$('#add-recipe-btn').removeClass('btn-success')
	}

	const onAddIngredientSuccess = (_, _2, _3) => {
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

		$.ajax({
			error: onError,
			method: 'POST',
			success: onAddIngredientSuccess,
			url: url,
		})
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

		// li will have ID so remove duplicate ID
		const id = $elem.attr('id')
		$elem.attr('id', '')

		const $li = $('<li></li>').append($elem)
		$li.attr('id', id)
		$(`#${formType}-form-ingredients`).append($li)
	}

	const initAddPage = () => {
		addIngredientInput('add-recipe')
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
	// @return {jQuery element} The recipe element.
	const createProfileRecipe = (name) => {
		const $ret = $('#template-profile-recipe').clone()
		$ret.removeClass('d-none')

		const id = getID()
		$ret.attr('id', id)

		const $buttons = $ret.find('button')
		const $deleteBtn = $buttons[0]
		const $confirmBtn = $buttons[1]
		$($deleteBtn).attr('id', `${id}-delete`)
		$($confirmBtn).attr('id', `${id}-confirm`)

		// Delete the recipe on confirm
		$($confirmBtn).click(() => {
			const url = `${DATA_URL}?name=${name}`
			sendAjax('DELETE', {}, url, onDeleteRecipeSuccess, onError)
		})

		// Show the confirm button when clicked
		$($deleteBtn).click(() => onRecipeDeleteClick(id))

		const $link = $ret.find('a')
		$link.click(() => showRecipePage(name, true, 'my-recipes'))
		$link.html(name)

		return $ret
	}

	// Update information displayed on profile with given information.
	// @param data{Object} The new user information.
	const updateProfile = (data) => {
		user = data
		$('#profile-name').text(user.name ? user.name : '')
		$('#profile-recipe-list').html('')
		if (user.recipes) {
			user.recipes.forEach((recipe) => {
				$('#profile-recipe-list').append(createProfileRecipe(recipe.name))
			})
		}
		filterPantryTable('')
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
		$('#navbar-add-ingredient').removeClass('d-none')
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
		$('#navbar-add-ingredient').addClass('d-none')
		switchProfile('prompt')
		filterPantryTable('')
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
		// eslint-disable-next-line no-console
		console.log('Created account')
		// eslint-disable-next-line no-console
		console.log(data)
	}

	const createAccount = () => {
		$.ajax({
			error: onError,
			method: 'POST',
			success: onCreateAccountSuccess,
			url: DATA_URL + '/profile/create',
			data: {
				'username': $('#create-form-name').val(),
				'password': $('#create-form-pass').val()
			}
		})
	}

	const onGetPantrySuccess = (data, _, _2) => {
		user.pantry = data
		filterPantryTable('')
	}

	const getPantry = () => {
		sendAjax('GET', null, DATA_URL + '/pantry', onGetPantrySuccess)
	}

	// Filter the table to ingredients whose names match the term.
	// @param term{String} The term to filter on.
	const filterPantryTable = (term) => {
		const table = $('#filterTable')
		table.html('') // Clear contents

		for (const key in user.pantry) {
			const ingredient = user.pantry[key]

			// Filter out the ingredient if term is given and term is not a
			// substring of ingredient name
			if (term !== '' && ingredient.name.indexOf(term) === -1) {
				continue
			}

			const row = $('<div class="row"></div>')

			const name = $('<div class="col"></div>')
			name.html(ingredient.name)
			row.append(name)

			const amount = $('<div class="col"></div>')
			amount.html(ingredient.amount)
			row.append(amount)

			const unit = $('<div class="col"></div>')
			unit.html(ingredient.unit)
			row.append(unit)

			table.append(row)
		}
	}

	const parseRecipe = (data, _, _2) => {
		currentRecipe = data
		formatRecipeView(data)
	}

	const getRecipe = (name) => {
		$.ajax({
			error: onError,
			method: 'GET',
			success: parseRecipe,
			url: DATA_URL + '/recipe/' + name,
		})
	}

	const showRecipePage = (name, showEditBtn, returnPage) => {
		getRecipe(name)
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
		const opts = {'ingredients': true, 'name': true}
		searchForRecipes(term, opts)
	}

	// RECIPE ADD ==============================================================

	// Hide the page where the user can add a recipe to their profile and show
	// the "My Recipes" page.
	const hideAddRecipePage = () => {
		switchPage('my-recipes')
		$('#navbar').removeClass('d-none')
	}

	// Show the page where the user can add a recipe to their profile and hide
	// the "My Recipes" page.
	const showAddRecipePage = () => {
		switchPage('add-recipe')
		$('#navbar').addClass('d-none')
	}

	const onRecipeAddError = (data, _, _2) => {
		resetAddRecipeInvalidForms()
		const errs = data.responseJSON
		if (errs.includes('name-exists')) {
			showFormInvalid('#add-recipe-form-name')
		}
	}

	const onRecipeAddSuccess = () => {
		$('#add-recipe-btn').text('Saved!')
		$('#add-recipe-btn').addClass('btn-success')
		$('#add-recipe-btn').removeClass('btn-light')
		initRecipes()
		initProfile()
	}

	const addRecipe = () => {
		const recipe = {}
		recipe.name = $('#add-recipe-form-name').val()
		recipe.ingredients = []

		$('#add-recipe-form-ingredients').find('li').each((idx, elem) => {
			const ingredient = {}
			ingredient.name = $(elem).find('.name').first().val()
			ingredient.amount = $(elem).find('.amount').first().val()
			ingredient.unit = $(elem).find('.unit').first().val()
			ingredient.prep = $(elem).find('.prep').first().val()
			ingredient.note = $(elem).find('.note').first().val()

			recipe.ingredients.push(ingredient)
		})

		recipe.directions =
			$('#add-recipe-form-directions').val().split('\n')
				.filter((line) => line !== '')

		sendAjax('POST', recipe, `${DATA_URL}/add`, onRecipeAddSuccess,
			onRecipeAddError)
	}

	// PROFILE =================================================================

	// Initialize profile page
	const initProfile = () => {
		sendAjax('GET', {}, DATA_URL + '/profile/createAllowed',
			onGetCreateAllowedSuccess)

		sendAjax('GET', {}, DATA_URL + '/profile', onLoginSuccess)
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
		widget.filterPantryTable = filterPantryTable
		widget.getPantry = getPantry
		widget.hideAddRecipePage = hideAddRecipePage
		widget.hideChangePass = hideChangePass
		widget.initAddPage = initAddPage
		widget.initProfile = initProfile
		widget.initRecipes = initRecipes
		widget.login = login
		widget.logout = logout
		widget.onRecipeSearch = onRecipeSearch
		widget.resetDeleteAccount = resetDeleteAccount
		widget.saveRecipeEdit = saveRecipeEdit
		widget.search = search
		widget.showChangePass = showChangePass
		widget.showAddRecipePage = showAddRecipePage
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
	app.getPantry()
	app.initProfile()
})
