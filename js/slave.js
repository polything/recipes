const config = require('./config')
const path = require('path')
const util = require('./util')

exports.masters = []

// TODO Resolve masters IP and store only IPs

function sendPings() {
    for (let master of config.options.slave.masters) {
        let dataURL =
            path.join(config.options.port + config.options.rootURL, 'data')

        util.asyncPost(master, JSON.stringify({'me': dataURL}))
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
