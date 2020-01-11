module.exports = {
	'no profile create option visible': browser => {
		browser
			.url('http://localhost:3000')
			.waitForElementVisible('body')
			.click('#navbar-profile')
			.assert.not.visible('#profile-prompt-navbar-create')
			.assert.not.visible('#profile-prompt-create')
			.end()
	},
}
