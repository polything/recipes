// Template for creating DB adapters
// Ver 0.0

// The file to import for the database. Replace 'mydb' with the name of the
// adapter
const mydb = require('mydb')

// Call to find recipes.
// @param {string} string Unescaped search term.
// @param {util.SearchOptions} options Search options defining what categories
//                                     to find the search term in.
// @return A Promise that resolves to an Array of util.Recipes or an error.
exports.find = (string, options) => new Promise((resolve, reject) => {
	try {
		var results = mydb.search(string, options)

		resolve(results)
	} catch (err) {
		reject(err)
	}
})
