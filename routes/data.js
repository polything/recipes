const express = require('express')
const router = express.Router()
const db = require('../js/dbAdapter.js')

router.post('/', (req, res) => {
    if (req.body === undefined || req.body === null) {
        // Ignore these requests
        return
    }
    var term = req.body.term
    var options = req.body.options
    db.find(term, options)
        .then((results) => {
            res.status(200).json(results)
        })
})

module.exports = router
