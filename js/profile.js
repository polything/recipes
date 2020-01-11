// Is profile creation allowed?
// @return true if allowed; false otherwise.
exports.creationAllowed = () => {
	return process.env.ALLOW_ACCOUNT_CREATION === 'true'
}
