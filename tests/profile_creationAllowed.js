const test = require('ava')

const profile = require('../js/profile')

test('true when "true"', t => {
	process.env.ALLOW_ACCOUNT_CREATION = 'true'
	t.is(true, profile.creationAllowed())
})

test('false when "false"', t => {
	process.env.ALLOW_ACCOUNT_CREATION = 'false'
	t.is(false, profile.creationAllowed())
})

test('false when undefined', t => {
	process.env.ALLOW_ACCOUNT_CREATION = undefined
	t.is(false, profile.creationAllowed())
})
