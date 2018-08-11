const express = require('express')
const router = express.Router()

var slaves = new Set()

router.post('/', (req, res) => {
    if (req.body === undefined || req.body === null) {
        // Ignore these requests
        return
    }

    //var options = req.body.options
    console.log(req.ips)
    slaves.add(req.ips)
    res.status(200).json({'status': 'OK'})
})

module.exports = router
