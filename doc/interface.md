# HTTP Interface
Interface for the application.

## Request recipes
Send the following to a server or client to get recipes.

Target: xxx.xxx.xxx.xxx/data

Request type: JSON

HTTP Method: `POST`

* `options {Object}` Options for the search.
    * `ingredients {boolean}` `true` to search in ingredients.
    * `title {boolean}` `true` to search in title.
* `term {string}` The string to search for.

### Response
* `recipes {Array}` Array of recipes.
    * `title {string}` Title of the recipe.
    * `ingredients {Object}` Ingredients for the recipe.
        * `name {string}` Name of the ingredient.
        * `unit {string}` A unit from the unit list.
        * `amount {float}` Amount of the ingredient.
        * `prep {string}` Preparation method.
        * `note {string}` Ingredient note.
    * `directions {Array}` Array of direction strings.


## Delete recipes

URL: `/data?title=X`

Format: JSON

HTTP Method: `DELETE`

### Response

| Code | Data |
| :---: | --- |
| 200 | None |
| 404 | None |
