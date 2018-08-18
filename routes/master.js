const express = require('express')
const router = express.Router()

exports.slaves = new Set()

router.post('/', (req, res) => {
    if (req.body === undefined || req.body === null) {
        // Ignore these requests
        return
    }

    let clientIP = req.ip

    // Trim IPv6 prefix
    // TODO Handle IPv6
    if (clientIP.startsWith('::ffff:')) {
        clientIP = clientIP.substring(7)
    }

    let port = req.body.me
    let key = clientIP + ':' + port
    if (!exports.slaves.has(key)) {
        exports.slaves.add(key)
        console.log('+slave ' + key)
    }

    res.status(200).json({'status': 'OK'})
})

module.exports = router
