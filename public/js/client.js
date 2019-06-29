// Client-side controller code

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
	if (term === '') {
		var tableBody = document.getElementById(id)
		tableBody.innerHTML = '' // Clear contents
		return
	}

	queryDB(term)
		.then((results) => {
			var tableBody = document.getElementById(id)
			tableBody.innerHTML = '' // Clear contents
			results.forEach((recipe) => {
				let link = document.createElement('a')
				link.setAttribute('href', RECIPE_URL + '/' + recipe.title)
				link.innerHTML = recipe.title

				let title = document.createElement('td')
				title.appendChild(link)

				let deleteButton = document.createElement('button')
				deleteButton.innerHTML = 'X'
				let data = '/data?title=' + recipe.title
				$(deleteButton).click(data, deleteFunc)

				let remove = document.createElement('td')
				remove.appendChild(deleteButton)

				let row = document.createElement('tr')
				row.appendChild(title)
				row.appendChild(remove)
				tableBody.appendChild(row)
			})
		})
		.catch(err => console.log(err))
}
