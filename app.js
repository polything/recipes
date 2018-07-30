const express = require('express')
const app = express()

const home = require('./routes/home')
const data = require('./routes/data')

// Body-handling middleware
app.use(express.json())
app.use(express.urlencoded())

// Routes
app.use('/', home)
app.use('/data', data)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => { console.log('Listening on port ' + PORT) })
