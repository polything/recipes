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

				let row = document.createElement('tr')
				row.appendChild(title)
				tableBody.appendChild(row)
			})
		})
		.catch(err => console.log(err))
}
