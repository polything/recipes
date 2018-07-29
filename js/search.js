// eslint-disable-next-line no-unused-vars
const search = (event, elem, callback) => {
    if (event.key == 'Enter') {
        callback(elem.value)
    }
}
