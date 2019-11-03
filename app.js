const path = require('path')

const dotenv = require('dotenv')
const errorHandler = require('errorhandler')
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')

const app = express()
const mongostore = require('connect-mongo')(session)

dotenv.config({ path: '.env' })


// Mongoose setup
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('error', (err) => {
	console.error(err)
	console.log('MongoDB connection error. Please make sure MongoDB is running.')
	process.exit()
})


// Unused import but needs to configure passport prior to initializtion
require('./auth/passport')


// Configure app
app.set('host', '0.0.0.0')
app.set('port', process.env.PORT || 3000)
app.use(express.json())
app.use(express.urlencoded())
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
	store: new mongostore({
		url: process.env.MONGODB_URI,
		autoReconnect: true,
	})
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/deps', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))
app.use('/deps', express.static(path.join(__dirname, 'node_modules/bootstrap/dist'), { maxAge: 31557600000 }))
app.use('/deps/js', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }))

const rootURL = process.env.ROOT_URL
app.use(rootURL, require('./routes/home'))
app.use(path.join(rootURL, 'data'), require('./routes/data'))
app.use(path.join(rootURL, 'login'), require('./routes/login'))

app.disable('x-powered-by')


// Deployment settings
if (process.env.NODE_ENV === 'development') {
	// Only use in development
	app.use(errorHandler())
} else {
	app.use((err, req, res, _) => {
		console.error(err)
		res.status(500).send('Server Error')
	})
}

// Start app
app.listen(app.get('port'), () => {
	console.log(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`)
	console.log('Press CTRL-C to stop\n')
})
