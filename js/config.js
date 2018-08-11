const fs = require('fs')

exports.options = {}

exports.load = (configPath) => new Promise((resolve, reject) => {
    fs.readFile(configPath, 'utf8', (err, contents) => {
        if (err) reject(err)
        exports.options = JSON.parse(contents)
        resolve(exports.options)
    })
})
