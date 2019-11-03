/* eslint-env browser, jquery */
/* global app, DATA_URL */

(() => {
	let pantry = {}
	let defaultRecipes = []
	let profileInfo = {}

	// currentRecipe is used in parseRecipe(3)
	// eslint-disable-next-line no-unused-vars
	let currentRecipe = {}

	// Send JSON with method POST and call the callback when the response arrives
	// eslint-disable-next-line no-unused-vars
	const asyncPost = (url, data, callback) => {
		const xhttp = new XMLHttpRequest()
		xhttp.open('POST', url, true)
		xhttp.setRequestHeader('Content-Type', 'application/json')
		xhttp.onreadystatechange = () => {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 200) {
					callback(null, JSON.parse(this.responseText))
				} else {
					callback({
						'status': this.status
					}, null)
				}
			}
		}
		xhttp.send(JSON.stringify(data))
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

	// eslint-disable-next-line no-unused-vars
	const saveRecipe = (url) => {
		const recipe = {}
		recipe.name = $('#recipe-form-name').val()
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

	// eslint-disable-next-line no-unused-vars
	const editRecipe = () => {
		switchPage('edit-recipe')
		$('#navbar').addClass('d-none')

		formatRecipeEdit(currentRecipe)
	}

	const formatRecipeEdit = (recipe) => {
		$('#recipe-form-name').val(recipe.name)

		$('#recipe-form-ingredients').html('')
		recipe.ingredients.forEach(ingredient => {
			addFormIngredient(ingredient)
		})

		$('#recipe-form-directions').val(recipe.directions.join('\n\n'))
	}

	const backToRecipeView = () => {
		switchPage('home')
		$('#navbar').removeClass('d-none')
	}

	// eslint-disable-next-line no-unused-vars
	const saveRecipeEdit = () => {
		backToRecipeView()

		saveRecipe(DATA_URL + '/recipe/edit')
	}

	const updateRecipeList = (recipes) => {
		$('#searchResults').html('') // Clear contents
		recipes.forEach((recipe) => {
			// Recipe name
			const $link = $('<a></a>')
			$link.attr('href', '#')
			$link.click(() => showRecipeView(recipe.name))
			$link.html(recipe.name)

			const $nameCol = $('<div></div>')
			$nameCol.addClass('col-auto')
			$nameCol.append($link)

			// Delete button
			const $butt = $('<button>X</button>')
			$butt.click('/data?name=' + recipe.name, deleteFunc)

			const $deleteCol = $('<div></div>')
			$deleteCol.addClass('col-1')
			$deleteCol.append($butt)

			const $row = $('<div></div>')
			$row.addClass('row justify-content-between')
			$row.append($nameCol)
			$row.append($deleteCol)

			$('#searchResults').append($row)
		})
	}

	// eslint-disable-next-line no-unused-vars
	const queryDB = (term) => new Promise((resolve, reject) => {
		const body = {
			'options': {'ingredients': true, 'name': true},
			'term': term
		}

		asyncPost(DATA_URL, body, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})

	const deleteFunc = (event) => {
		$.ajax({
			url: event.data,
			method: 'DELETE'
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

	// eslint-disable-next-line no-unused-vars
	const onRecipeSearch = (term) => {
		if (term === '') {
			updateRecipeList(defaultRecipes)
		} else {
			const opts = {'ingredients': true, 'name': true}
			searchForRecipes(term, opts)
		}
	}

	// eslint-disable-next-line no-unused-vars
	const search = (event, elem, callback) => {
		callback(elem.value)
	}

	// eslint-disable-next-line no-unused-vars
	const submitRecipe = () => {
		const recipe = {}
		recipe.name = $('#name').val()
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

		const recipes = {'recipes': [recipe]}

		asyncPost(DATA_URL + '/add', recipes, (err, _) => {
			if (err) {
				// eslint-disable-next-line no-console
				console.log(err)
			} else {
				// eslint-disable-next-line no-console
				console.log('Data added')
			}
		})
	}

	const onAddIngredientSuccess = (_, _2, _3) => {
		getPantry()
	}

	// eslint-disable-next-line no-unused-vars
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

	// eslint-disable-next-line no-unused-vars
	const removeElement = (id) => {
		$('#' + id).remove()
	}

	const addIngredientInput = () => {
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

	const initAddPage = () => {
		addIngredientInput()
	}

	// eslint-disable-next-line no-unused-vars
	const switchProfilePrompt = (name) => {
		$('.page-profile-prompt').addClass('d-none')
		$('#profile-prompt-' + name).removeClass('d-none')
		$('.profile-nav').removeClass('active')
		$('#profile-prompt-navbar-' + name).addClass('active')
	}

	// eslint-disable-next-line no-unused-vars
	const onError = (_, statusStr, errStr) => {
		// eslint-disable-next-line no-console
		console.log(statusStr)
		// eslint-disable-next-line no-console
		console.log(errStr)
	}

	const updateProfile = (data) => {
		profileInfo = {
			'username': data.username ? data.username : ''
		}
		$('#profile-name').text(profileInfo.username)
	}

	const switchProfile = (name) => {
		$('.page-profile').addClass('d-none')
		$('#profile-' + name).removeClass('d-none')
	}

	const onLoginSuccess = (data, _, _2) => {
		// eslint-disable-next-line no-console
		console.log('Logged in')
		updateProfile(data)
		switchProfile('view')
		getPantry()
	}

	// eslint-disable-next-line no-unused-vars
	const login = () => {
		$.ajax({
			error: onError,
			method: 'POST',
			success: onLoginSuccess,
			url: '/login',
			data: {
				'username': $('#login-form-name').val(),
				'password': $('#login-form-pass').val()
			}
		})
	}

	const onLogoutSuccess = (data, _, _2) => {
		// eslint-disable-next-line no-console
		console.log('Logged out')
		// eslint-disable-next-line no-console
		console.log(data)
		updateProfile(data)
		switchProfile('prompt')
		filterPantryTable('')
	}

	// eslint-disable-next-line no-unused-vars
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

	// eslint-disable-next-line no-unused-vars
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

	// eslint-disable-next-line no-unused-vars
	const getPantry = () => {
		$.ajax({
			error: (_, _2, _3) => {
				pantry = {}
				filterPantryTable('')
			},
			method: 'GET',
			success: (data, _, _2) => {
				pantry = data
				filterPantryTable('')
			},
			url: DATA_URL + '/pantry',
		})
	}

	// Filter the table to ingredients whose names match the term.
	// @param term{String} The term to filter on.
	const filterPantryTable = (term) => {
		const table = $('#filterTable')
		table.html('') // Clear contents

		for (const key in pantry) {
			const ingredient = pantry[key]

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

	const getRecipeErr = (_, statusStr, errStr) => {
		// eslint-disable-next-line no-console
		console.log(statusStr)
		// eslint-disable-next-line no-console
		console.log(errStr)
	}

	const showRecipeView = (name) => {
		$('#view-recipe').removeClass('d-none')
		$('#view-search').addClass('d-none')

		$.ajax({
			error: getRecipeErr,
			method: 'GET',
			success: parseRecipe,
			url: DATA_URL + '/recipe/' + name,
		})
	}

	// eslint-disable-next-line no-unused-vars
	const hideRecipeView = () => {
		$('#view-recipe').addClass('d-none')
		$('#view-search').removeClass('d-none')
		formatRecipeView({
			name: 'Loading recipe...',
			ingredients: [],
			directions: [],
		})
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

	// eslint-disable-next-line no-unused-vars
	const switchPage = (page) => {
		$('.page').addClass('d-none')
		$('#page-' + page).removeClass('d-none')
		$('.main-nav').removeClass('active')
		$('#navbar-' + page).toggleClass('active')
	}

	const initProfile = () => {
		$.ajax({
			error: onError,
			method: 'GET',
			success: (data, _, _2) => {
				if (!data.allowed) {
					$('#profile-prompt-navbar-create').addClass('d-none')
					const $login = $('#profile-prompt-navbar-login')
					$login.removeClass('active nav-link')
					$login.removeAttr('onclick href')
				}
			},
			url: DATA_URL + '/profile/createAllowed'
		})
	}

	const initRecipes = () => {
		const term = 'a'
		const opts = {'ingredients': true, 'name': true}
		searchForRecipes(term, opts)
	}

	const constructor = () => {
		// The recipe module to return
		const widget = {}

		widget.addIngredientInput = addIngredientInput
		widget.addFormIngredient = addFormIngredient
		widget.backToRecipeView = backToRecipeView
		widget.createAccount = createAccount
		widget.editRecipe = editRecipe
		widget.filterPantryTable = filterPantryTable
		widget.getPantry = getPantry
		widget.hideRecipeView = hideRecipeView
		widget.initAddPage = initAddPage
		widget.initProfile = initProfile
		widget.initRecipes = initRecipes
		widget.login = login
		widget.logout = logout
		widget.onRecipeSearch = onRecipeSearch
		widget.saveRecipeEdit = saveRecipeEdit
		widget.search = search
		widget.submitIngredient = submitIngredient
		widget.submitRecipe = submitRecipe
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
