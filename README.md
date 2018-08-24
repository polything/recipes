# Configuration

## Config path
Set the configuration file to use by setting `RECIPE_CONFIG` to the path of the configuration file to use. If `RECIPE_CONFIG` is not specified, `config.json` in the directory of the package is used.

## Configuration file
* `port {integer}`
    Port to serve requests on.
* `master`
    Master node configuration options
    * `enable {boolean}`
        `true` if the instance should run as a master node.
    * `search {boolean}`
        Type of search to perform.
        |Name|Description|
        |local-only|Only search local database.|
        |slaves-only|Only request recipes from slaves.|
        |both|Search both the local database and slaves.|
* `slave`
    Slave node configuration options
    * `enable {boolean}`
        `true` if the instance should run as a slave node.
    * `masters {Array}`
        Array of master node URIs to ping to notify of availability.
* `localDB`
    The local database.
    * `type {string}`
        The name of the file (without the '.js' extension). For example, if the adapter is `mongodb.js`, the value would be `mongodb`.
    * `options {Object}`
    Options for this particular database adapter.

## Configuration options access
To access the configuration file in code, import `js/config.js` and access options from the `options` member.

```javascript
// dbAdapters/mydb.js
const config = require('../js/config')

console.log(config.options.localDB.options.myoption)
```
