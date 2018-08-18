const util = require('util')

const DEFAULT_NUM_SLAVES = 5

exports.slaves = new Set()

exports.createKey = (ip, port) => ip + ':' + port

exports.find = (string, options) => new Promise((resolve, _) => {
    let results = []
    let slaveIdxs = new Set()
    const DESIRED_NUM_SLAVES = options.numSlaves || DEFAULT_NUM_SLAVES
    const NUM_SLAVES = DESIRED_NUM_SLAVES > exports.slaves.length ?
        exports.slaves.length : DESIRED_NUM_SLAVES

    // Pick random slaves to query
    while (slaveIdxs.length < NUM_SLAVES) {
        slaveIdxs.add(Math.floor(Math.random() * exports.slaves.length))
    }

    slaveIdxs.forEach((idx) => {
        // Request slave search
        util.asyncPost(exports.slaves[idx], {options: options, term: string})
            .then((slaveResults) => {
                slaveResults.forEach((slaveResult) => {
                    let exists = (recipe) => recipe.title == slaveResult.title

                    if (!results.some(exists)) {
                        results.append(slaveResult)
                    }
                })
                resolve(results)
            })

        /*
        // TODO Add timeout for requests
        if ((options === undefined || options.title === true)
                && recipe.title.indexOf(string) !== -1) {
            results.push(recipe)
        }
        else if (options === undefined || options.ingredients === true) {
            for (let ingredient of recipe.ingredients) {
                if (ingredient.name.indexOf(string) !== -1) {
                    results.push(recipe)
                    break
                }
            }
        }
        */
    })
})
