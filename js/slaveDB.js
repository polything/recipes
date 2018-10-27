const util = require('./util')

const DEFAULT_NUM_SLAVES = 5

exports.slaves = new Map()
exports.createKey = (ip, port) => ip + ':' + port

exports.find = (string, options) => new Promise((resolve, _) => {
    let slaves = new Array()
    for (slaveID in exports.slaves) {
        slaves.push(slaveID)
    }

    let slaveIdxs = new Set()
    const DESIRED_NUM_SLAVES = options.numSlaves || DEFAULT_NUM_SLAVES
    const NUM_SLAVES = (DESIRED_NUM_SLAVES > slaves.length) ?
        slaves.length : DESIRED_NUM_SLAVES

    // Pick random slaves to query
    while (slaveIdxs.size < NUM_SLAVES) {
        slaveIdxs.add(Math.floor(Math.random() * slaves.length))
    }

    slaveIdxs.forEach((idx) => {
        // Request slave search
        let url = slaves[idx]
        let body = JSON.stringify({options: options, term: string})
        util.asyncPost(url, body)
            .then((results) => {
                let slaveResults = Array.from(results)
                slaveResults.forEach((slaveResult) => {
                    let exists = (recipe) => recipe.title == slaveResult.title
                    if (!results.some(exists)) {
                        results.push(slaveResult)
                    }
                })
                resolve(results)
            })
    })
})
