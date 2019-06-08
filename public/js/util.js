// Send JSON with method POST and call the callback when the response arrives
// eslint-disable-next-line no-unused-vars
const asyncPost = (url, data, callback) => {
	var xhttp = new XMLHttpRequest()
	xhttp.open('POST', url, true)
	xhttp.setRequestHeader('Content-Type', 'application/json')
	xhttp.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status == 200) {
				callback(null, JSON.parse(this.responseText))
			} else {
				callback({
					'status': this.status
				}, null)
			}
		}
	}
	xhttp.send(JSON.stringify(data))
}

const hasOwnProps = (obj, props) => {
	return props.every(field => obj.hasOwnProperty(field))
}
