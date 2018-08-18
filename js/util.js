const http = require('http')

// $1 = domain
// $2 = port
// $3 = path
const urlRegex = /(?:https?:\/\/)?(\w+\.\w+\.\w+|localhost|\d{3}\.\d{3}\.\d{3}\.\d{3})(:\d+)?(.*)/

// Send a POST and return a Promise resolving the response
exports.asyncPost = (url, body) => new Promise((resolve, _) => {
    let matches = url.match(urlRegex)
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
            resolve(res)
        })
    })

    req.write(body)
    req.end()
})

exports.recipesEqual = (r1, r2) => {
    if (r1.title != r2.title) return false
    // TODO Check ingredients
    //else if (r1.ingredients != r2.ingredients) return false
}
