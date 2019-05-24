# Configuration

## Config path
Set the configuration file to use by setting `RECIPE_CONFIG` to the path of the configuration file to use. If `RECIPE_CONFIG` is not specified, `config.json` in the repo is used.

## Configuration file
* `port {integer}` Port to serve requests on.
* `rootURL {string}` URL of the application's root.
* `localDB` Local database configuration options.
    * `type {string}` The name of the file (without the `.js` extension). For example, if the adapter is `mongodb.js`, the value would be `mongodb`.
    * `options {Object}` Options for this particular database adapter.

## Configuration options access
To access the configuration file in code, import `js/config.js` and access options from the `options` member.

```javascript
// dbAdapters/mydb.js
const config = require('../js/config')

console.log(config.options.localDB.options.myoption)
```
