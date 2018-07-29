var express = require('express')
var app = express()

// Define routes
app.get('/', (req, res) => {
    res.send('Hello')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => { console.log('Listening on port ' + PORT) })
