const config = require('./config')
const util = require('./util')

exports.masters = []

// TODO Resolve masters IP and store only IPs

function sendPings() {
    for (let master of config.options.slave.masters) {
        console.log('pinging ' + master)
        util.asyncPost(master, JSON.stringify({'me': config.options.port}))
            .then((results) => {
                if (('status' in results) && results.status === 'OK')
                {
                    // Do nothing
                } else {
                    console.log('Could not ping master at ' + master
                        + '. Are you sure this is the correct URL?')
                }
            })
            .catch((e) => {
                console.log('Could not reach master at ' + master + '. ' + e)
            })
    }

    setTimeout(sendPings, config.options.slave.heartbeatPeriod)
}

exports.startHeartbeat = () => {
    setTimeout(sendPings, config.options.slave.heartbeatPeriod)
}
