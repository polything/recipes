const express = require('express')
const router = express.Router()

const slaveDB = require('../js/slaveDB.js')

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
    let key = slaveDB.createKey(clientIP, port)
    if (!slaveDB.slaves.has(key)) {
        slaveDB.slaves.add(key)
        console.log('+slave ' + key)
    }

    res.status(200).json({'status': 'OK'})
})

module.exports = router
