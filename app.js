const config = require('./js/config')
const path = require('path')

config.load(process.env.RECIPE_CONFIG || __dirname + '/config.json')
	.then((configData) => {
		// eslint-disable-next-line no-console
		console.log(configData)

		const express = require('express')
		const app = express()

		const passport = require('passport')
		const session = require('express-session')

		require('./auth').init()

		// Body-handling middleware
		app.use(express.json())
		app.use(express.urlencoded())
		app.use(session({
			secret: config.options.sessionSecret,
			resave: false,
			saveUninitialized: false,
		}))
		app.use(passport.initialize())
		app.use(passport.session())

		const rootURL = config.options.rootURL
		const login = require('./routes/login')

		app.use(express.static('public'))
		app.use(rootURL, require('./routes/home'))
		app.use(path.join(rootURL, 'data'), require('./routes/data'))
		app.use(path.join(rootURL, 'login'), login)

		const PORT = process.env.PORT || config.options.port || 3000

		// eslint-disable-next-line no-console
		app.listen(PORT, () => console.log('Listening on port ' + PORT))
	})
	.catch(err => {
		// eslint-disable-next-line no-console
		console.log(err)
		process.exit(1)
	})
