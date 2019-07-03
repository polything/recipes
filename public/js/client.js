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
	$('#' + id).html('') // Clear contents

	if (term === '') {
		return
	}

	queryDB(term)
		.then(results => {
			results.forEach((recipe) => {
				// Recipe title
				const $link = $('<a></a>')
				$link.attr('href', RECIPE_URL + '/' + recipe.title)
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
