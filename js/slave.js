const config = require('./config')
const util = require('./util')

exports.masters = []

// TODO Resolve masters IP and store only IPs

function sendPings() {
    for (let master of config.options.slave.masters) {
        console.log('pinging ' + master)
        util.asyncPost(master, JSON.stringify({'me': config.options.port}))
    }

    setTimeout(sendPings, config.options.slave.heartbeatPeriod)
}

exports.startHeartbeat = () => {
    setTimeout(sendPings, config.options.slave.heartbeatPeriod)
}
