const express = require('express')
const router = express.Router()
const db = require('../js/dbAdapter.js')
const pug = require('pug')

router.get('/', (req, res) => {
    res.redirect('/')
})

router.get('/:recipeTitle', (req, res) => {
    var options = {ingredients:false, title: true}
    var term = req.params.recipeTitle
    db.find(term, options)
        .then((results) => {
            var recipe = (results.length > 0 ? results[0] : null)
            res.send(pug.renderFile('./views/recipe.pug', {'recipe': recipe}))
        })
})

module.exports = router
