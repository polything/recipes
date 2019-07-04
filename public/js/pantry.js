var pantry = {}

function parsePantry(data, statusStr, _) {
	pantry = data
}

function getPantryErr(jqXHR, statusStr, errStr) {
	console.log(statusStr)
	console.log(errStr)
}

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

	for (var key in pantry) {
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
		success: (data, statusStr, _) => {
			pantry = data
			filterTable('')
		},
		url: DATA_URL + '/pantry'
	})
})
