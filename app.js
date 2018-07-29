var express = require('express')
var app = express()
const home = require('./routes/home')

// Define routes
app.use('/', home)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => { console.log('Listening on port ' + PORT) })
