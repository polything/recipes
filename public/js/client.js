// Client-side controller code

// Send a POST and call the callback when the response arrives
// eslint-disable-next-line no-unused-vars
const asyncPost = (url, body, callback) => {
	var xhttp = new XMLHttpRequest()
	xhttp.open('POST', url, true)
	xhttp.setRequestHeader('Content-Type', 'application/json')
	xhttp.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
			callback(this.responseText)
		}
	}
	xhttp.send(body)
}

// eslint-disable-next-line no-unused-vars
const queryDB = (term) => new Promise((resolve, reject) => {
	var body = {
		'options': {'ingredients': true, 'title': true},
		'term': term
	}
	asyncPost(DATA_URL, JSON.stringify(body), (resText) => {
		resolve(JSON.parse(resText))
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
}
