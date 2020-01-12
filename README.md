# Recipes
A server for recipes.

## Starting the service

Copy `.env.example` to `.env`, change the value of `SESSION_SECRET`, and then run the start command.

```
$ cp .env.example .env
$ make serve
```

## Configuration

**File**
Rename the given `.env.example` to `.env` and modify with custom values.

**Environment variable**
Configuration options can also be specified as environment variables instead of in a `.env` file.

### Configuration options

key | default | description
:---: | :---: | :---
`ALLOW_ACCOUNT_CREATION` | `false` | Allow clients to create accounts. If `false`, the option to create an account is not shown to the client.
`MONGODB_URI` | `undefined` | The URI of the MongoDB server to connect to.
`PORT` | `3000` | The port to have the service bind to (e.g. 3000).
`ROOT_URL` | `/` | The URI this service serves from. For example, if a reverse proxy forwards the URI `https://mysite.com/recipes` to this service, then the value must be `/recipes` in order for the service to serve its assets and reach API calls for the client.
`SESSION_SECRET` | `undefined` | The secret used to sign session ID cookies. See [express-session](https://github.com/expressjs/session) for more information. It is **highly** recommended to change this from the default.
