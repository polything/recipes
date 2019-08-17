var pantry = {}
var currentRecipe = {}
var profileInfo = {}

// Send JSON with method POST and call the callback when the response arrives
// eslint-disable-next-line no-unused-vars
const asyncPost = (url, data, callback) => {
	var xhttp = new XMLHttpRequest()
	xhttp.open('POST', url, true)
	xhttp.setRequestHeader('Content-Type', 'application/json')
	xhttp.onreadystatechange = function() {
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

const hasOwnProps = (obj, props) => {
	return props.every(field => obj.hasOwnProperty(field))
}

// eslint-disable-next-line no-unused-vars
const queryDB = (term) => new Promise((resolve, reject) => {
	var body = {
		'options': {'ingredients': true, 'title': true},
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

// eslint-disable-next-line no-unused-vars
const updateRecipeTable = (id, term) => {
	$('#' + id).html('') // Clear contents

	if (term === '') {
		return
	}

	queryDB(term)
		.then(results => {
			results.forEach((recipe) => {
				// Recipe title
				const $link = $('<a></a>')
				$link.attr('href', '#')
				$link.click(() => showRecipeView(recipe.title))
				$link.html(recipe.title)

				const $titleCol = $('<div></div>')
				$titleCol.addClass('col-auto')
				$titleCol.append($link)

				// Delete button
				const $butt = $('<button>X</button>')
				$butt.click('/data?title=' + recipe.title, deleteFunc)

				const $deleteCol = $('<div></div>')
				$deleteCol.addClass('col-1')
				$deleteCol.append($butt)

				const $row = $('<div></div>')
				$row.addClass('row justify-content-between')
				$row.append($titleCol)
				$row.append($deleteCol)

				$('#' + id).append($row)
			})
		})
}

// eslint-disable-next-line no-unused-vars
const search = (event, elem, callback) => {
	callback(elem.value)
}

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

function switchProfilePrompt(name) {
	$('.page-profile-prompt').addClass('d-none')
	$('#profile-prompt-' + name).removeClass('d-none')
	$('.profile-nav').removeClass('active')
	$('#profile-prompt-navbar-' + name).addClass('active')
}

function onError(_, statusStr, errStr) {
	console.log(statusStr)
	console.log(errStr)
}

function updateProfile(data) {
	profileInfo = {
		'username': data.username ? data.username : ''
	}
	$('#profile-name').text(profileInfo.username)
}

function switchProfile(name) {
	$('.page-profile').addClass('d-none')
	$('#profile-' + name).removeClass('d-none')
}

function onLoginSuccess(data, _, _) {
	console.log('Logged in')
	console.log(data)
	updateProfile(data)
	switchProfile('view')
}

function login() {
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

function onLogoutSuccess(data, _, _) {
	console.log('Logged out')
	console.log(data)
	updateProfile(data)
	switchProfile('prompt')
}

function logout() {
	$.ajax({
		error: onError,
		method: 'GET',
		success: onLogoutSuccess,
		url: '/data/profile/logout'
	})
}

function onCreateAccountSuccess(data, _, _) {
	console.log('Created account')
	console.log(data)
}

function createAccount() {
	$.ajax({
		error: onError,
		method: 'POST',
		success: onCreateAccountSuccess,
		url: '/data/profile/create',
		data: {
			'username': $('#create-form-name').val(),
			'password': $('#create-form-pass').val()
		}
	})
}

function parsePantry(data, _, _) {
	pantry = data
}

function getPantry() {
	$.ajax({
		error: onError,
		method: 'GET',
		success: parsePantry,
		url: DATA_URL + '/pantry',
	})
}

function filterTable(val) {
	const table = $('#filterTable')
	table.html('') // Clear contents

	for (var key in pantry) {
		const item = pantry[key]
		if (val !== '' && item.name.indexOf(val) === -1) {
			continue
		}

		const row = $('<div class="row"></div>')

		const name = $('<div class="col"></div>')
		name.html(item.name)
		row.append(name)

		const amount = $('<div class="col"></div>')
		amount.html(item.amount)
		row.append(amount)

		const unit = $('<div class="col"></div>')
		unit.html(item.unit)
		row.append(unit)

		table.append(row)
	}
}

function parseRecipe(data, _, _) {
	currentRecipe = data
	formatRecipeView(data)
}

function getRecipeErr(_, statusStr, errStr) {
	console.log(statusStr)
	console.log(errStr)
}

function showRecipeView(name) {
	$('#view-recipe').removeClass('d-none')
	$('#view-search').addClass('d-none')

	$.ajax({
		error: getRecipeErr,
		method: 'GET',
		success: parseRecipe,
		url: DATA_URL + '/recipe/' + name,
	})
}

function hideRecipeView() {
	$('#view-recipe').addClass('d-none')
	$('#view-search').removeClass('d-none')
	formatRecipeView({
		title: 'Loading recipe...',
		ingredients: [],
		directions: [],
	})
}

function formatRecipeView(recipe) {
	$('#recipe-name').html(recipe.title)

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

function switchPage(page) {
	$('.page').addClass('d-none')
	$('#page-' + page).removeClass('d-none')
	$('.main-nav').removeClass('active')
	$('#navbar-' + page).toggleClass('active')
}

function initPantry() {
	$.ajax({
		error: onError,
		method: 'GET',
		success: (data, statusStr, _) => {
			pantry = data
			filterTable('')
		},
		url: DATA_URL + '/pantry'
	})
}

function initProfile() {
	$.ajax({
		error: onError,
		method: 'GET',
		success: (data, statusStr, _) => {
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

$(() => {
	initAddPage()
	initPantry()
	initProfile()
})
