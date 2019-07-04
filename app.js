const config = require('./js/config')
const path = require('path')

config.load(process.env.RECIPE_CONFIG || __dirname + '/config.json')
	.then((configData) => {
		console.log(configData)

		const express = require('express')
		const app = express()

		// Body-handling middleware
		app.use(express.json())
		app.use(express.urlencoded())

		const rootURL = config.options.rootURL
		app.use(express.static('public'))
		app.use(rootURL, require('./routes/home'))
		app.use(path.join(rootURL, 'add'), require('./routes/add'))
		app.use(path.join(rootURL, 'data'), require('./routes/data'))
		app.use(path.join(rootURL, 'pantry'), require('./routes/pantry'))
		app.use(path.join(rootURL, 'recipe'), require('./routes/recipe'))

		const PORT = process.env.PORT || config.options.port || 3000
		app.listen(PORT, () => console.log('Listening on port ' + PORT))
	})
	.catch(err => {
		console.log(err)
		process.exit(1)
	})
