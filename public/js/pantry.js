/* eslint-env browser, jquery */
/* global DATA_URL */

let pantry = {}

function parsePantry(data, _, _2) {
	pantry = data
}

function getPantryErr(jqXHR, statusStr, errStr) {
	// eslint-disable-next-line no-console
	console.log(statusStr)
	// eslint-disable-next-line no-console
	console.log(errStr)
}

// eslint-disable-next-line no-unused-vars
function getPantry() {
	$.ajax({
		error: getPantryErr,
		method: 'GET',
		success: parsePantry,
		url: DATA_URL + '/pantry',
	})
}

function filterTable(val) {
	const table = $('#filterTable')
	table.html('') // Clear contents

	for (const key in pantry) {
		const item = pantry[key]
		if (val !== '' && item.name.indexOf(val) !== -1) {
			continue
		}

		const row = $('<div class="row"></div>')

		const name = $('<div class="col"></div>')
		name.html(item.name)
		row.append(name)

		const amount = $('<div class="col"></div>')
		amount.html(item.amount)
		row.append(amount)

		const unit = $('<div class="col"></div>')
		unit.html(item.unit)
		row.append(unit)

		table.append(row)
	}
}

$(() => {
	$.ajax({
		error: getPantryErr,
		method: 'GET',
		success: (data, _, _2) => {
			pantry = data
			filterTable('')
		},
		url: DATA_URL + '/pantry'
	})
})
