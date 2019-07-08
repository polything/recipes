function createIngredientInput() {
	const $ret = $('#template-ingredient-input').clone()
	const id = getID()
	$ret.attr('id', id)
	$ret.find('button').click(() => removeElement(id))
	return $ret
}
