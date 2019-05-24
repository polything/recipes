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

		// Routes
		const home = require('./routes/home')
		const data = require('./routes/data')
		const recipe = require('./routes/recipe')

		const rootURL = config.options.rootURL
		app.use(express.static('public'))
		app.use(rootURL, home)
		app.use(path.join(rootURL, 'data'), data)
		app.use(path.join(rootURL, 'recipe'), recipe)

		const PORT = process.env.PORT || config.options.port || 3000
		app.listen(PORT, () => console.log('Listening on port ' + PORT))
	})
