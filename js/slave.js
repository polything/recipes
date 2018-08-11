const config = require('../js/config')
const http = require('http')

// $1 = domain
// $2 = path
const urlRegex = /(?:https?:\/\/)?(\w+\.\w+\.\w+|localhost|\d{3}\.\d{3}\.\d{3}\.\d{3})(:\d+)?(.*)/

// Send a GET and call the callback when the response arrives
const asyncPost = (url, body, callback) => {
    console.log('post to ' + url)
    let matches = url.match(urlRegex)
    console.log(matches)
    let host = matches[1]
    let port = matches[2].substr(1)
    let path = matches[3]
    let req = http.request({
        agent: false,
        headers: {
            'Content-Type': 'application/json'
        },
        hostname: host,
        method: 'POST',
        path: path,
        port: port
    }, (res) => {
        res.on('end', () => {
            callback(res)
        })
    })

    req.write(body)
    req.end()
}

function sendPings() {
    console.log('sendpings')
    for (let master of config.options.slave.masters) {
        console.log('pinging ' + master)
        asyncPost(master, JSON.stringify({'me': config.options.port}), () => {/*Do nothing*/})
    }

    setTimeout(sendPings, config.options.slave.heartbeatPeriod)
}

exports.startHeartbeat = () => {
    setTimeout(sendPings, config.options.slave.heartbeatPeriod)
}
