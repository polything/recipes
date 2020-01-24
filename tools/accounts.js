const dotenv = require('dotenv')
const mongoose = require('mongoose')

const db = require('../js/db')

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


const handleCreate = async (args) => {
	if (args.length !== 2) {
		console.error('Usage: create username password')
		return
	}

	const username = args[0]
	const password = args[1]

	if (await db.usernameExists(username)) {
		console.error(`Username '${username}' taken`)
		return
	}

	const err = await db.createUser(username, password)
	if (err) { console.error(err) }
	else { console.log(`Created user '${username}'`) }
}

const handleRm = async (args) => {
	if (args.length !== 1) { console.error('Usage: rm username') }

	const username = args[0]
	if (!(await db.usernameExists(username))) {
		console.error(`User '${username}' does not exist`)
		return
	}

	if (await db.deleteUser(username)) {
		console.log(`User '${username}' deleted`)
	} else { console.error('Unknown error') }
}

const handleShow = async (args) => {
	if (args.length === 0) {
		const data = await db.getAllUsers()
		data.forEach((user) => { console.log(user.name) })
	} else if (args.length === 1) {
		const username = args[0]
		const data = await db.getUser(username)
		console.log(data)
	} else { console.error('Usage: show [username]') }
}

const main = async () => {
	let args = process.argv.slice(2)
	const command = args[0]
	args = args.slice(1)
	if (command === 'create') { await handleCreate(args) }
	else if (command === 'show') { await handleShow(args) }
	else if (command === 'rm') { await handleRm(args) }
	else { console.error(`Unknown command ${command}`) }

	process.exit()
}

main()
