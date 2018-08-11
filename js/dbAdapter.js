const Promise = require('promise')
const fs = require('fs')
var data = null
var loaded = false

// Async load data
fs.readFile(__dirname + '/../recipes.json', 'utf8', (err, contents) => {
    if (err) throw err
    data = JSON.parse(contents)
    loaded = true
})

exports.find = (string, options) => new Promise((resolve, reject) => {
    if (!loaded) {
        reject(new Error('Database not yet loaded'), {})
    }

    var results = []
    data.recipes.forEach((recipe) => {
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
    })
    resolve(results)
})
