/* eslint-env browser, jquery */
import $ from 'jquery/dist/jquery.min.js'

// Get the pantry item Object from the pantry form contents.
export const get = () => {
	const re = /(\d+(?:.\d+)?)\s+(cup|floz|g|gal|kg|lb|liter|oz|pint|quart|tbsp|tsp)\s+([a-zA-Z0-9\s]+)/
	const val = $('#pantry-form').val()

	// Check if input is empty
	if (val === '') {
		showNoItemError()
		return null
	}

	const match = re.exec(val)

	if (match === null) {
		showParseError()
		return null
	}

	return {
		amount: Number(match[1]),
		unit: match[2].trim(),
		name: match[3].trim()
	}
}

// Hide the pantry item error text
export const hideError = () => {
	$('#pantry-form').removeClass('is-invalid')
	$('#pantry-form-help').addClass('d-none')
}

// Reset the pantry item add form to have no contents.
export const reset = () => {
	$('#pantry-form').val('')
	hideError()
}

// Show error text
const showError = (text) => {
	$('#pantry-form').addClass('is-invalid')
	$('#pantry-form-help').removeClass('d-none')
	$('#pantry-form-help').text(text)
}

// No item input
export const showNoItemError = () => {
	showError('No item information')
}

// Item text can't be parsed.
export const showParseError = () => {
	showError('Cannot parse item. Be sure it is like "1 cup tomato paste"')
}

// Show save in progress
export const showSaveInProgress = () => {
	const $saveStatus = $('#pantry-save-status')
	$saveStatus.fadeIn(0, () => { $saveStatus.text('Saving...') } )
}

// Show save success
export const showSaveSuccess = () => {
	const $saveStatus = $('#pantry-save-status')
	$saveStatus.text('Saved')
	setTimeout(() => {
		$saveStatus.fadeOut(500, () => {
			$saveStatus.text('')
		})
	}, 1000)
}
