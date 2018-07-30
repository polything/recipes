// Client-side data request tools

// eslint-disable-next-line no-unused-vars
const queryDB = (term) => new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/data', true)
    xhttp.setRequestHeader('Content-Type', 'application/json')
    xhttp.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            resolve(JSON.parse(this.responseText))
        }
    }
    var body = JSON.stringify({
        'options': {'ingredients': true, 'title': true},
        'term': term
    })
    xhttp.send(body)
})

// eslint-disable-next-line no-unused-vars
const updateRecipeTable = (id, term) => {
    queryDB(term)
        .then((results) => {
            var tableBody = document.getElementById(id)
            tableBody.innerHTML = '' // Clear contents
            results.forEach((recipe) => {
                let title = document.createElement('td')
                let row = document.createElement('tr')
                title.innerHTML = recipe.title
                row.appendChild(title)
                tableBody.appendChild(row)
            })
        })
}
