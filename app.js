const config = require('./js/config')

config.load(process.env.RECIPE_CONFIG || __dirname + '/config.json')
    .then((configData) => {
        console.log(configData)

        const express = require('express')
        const app = express()

        const home = require('./routes/home')
        const data = require('./routes/data')
        const recipe = require('./routes/recipe')

        // Body-handling middleware
        app.use(express.json())
        app.use(express.urlencoded())

        // Routes
        app.use('/', home)
        app.use('/data', data)
        app.use('/recipe', recipe)

        if (configData.master.enable) {
            console.log('Running as a master instance')
            const master = require('./routes/master')
            app.use('/master', master)
        }

        if (configData.slave.enable) {
            console.log('Running as slave instance')
            const slave = require('./js/slave')
            slave.startHeartbeat()
        }

        const PORT = process.env.PORT || config.options.port || 3000
        app.listen(PORT, () => console.log('Listening on port ' + PORT))
    })
