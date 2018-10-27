const config = require('../js/config.js')
const express = require('express')
const router = express.Router()

const slaveDB = require('../js/slaveDB.js')

const slaveCullTimerID = setInterval(function() {
    const now = Date.now()
    for (slaveID in slaveDB.slaves) {
        let timeout = slaveDB.slaves[slaveID]
        if (now > timeout)
        {
            delete slaveDB.slaves[slaveID]
            console.log('-slave ' + slaveID)
        }
    }
}, config.options.master.slaveCullInterval)

// Client heartbeat received
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
    if (!(key in slaveDB.slaves))
    {
        console.log('+slave ' + key)
    }
    slaveDB.slaves[key] = Date.now() + config.options.master.slaveTimeout

    res.status(200).json({'status': 'OK'})
})

module.exports = router
