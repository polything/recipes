const express = require('express')
const passportConfig = require('../auth/passport')
const router = express.Router()

const Recipe = require('../models/Recipe')
const User = require('../models/User')

const util = require('../js/util')

// Get pantry
router.get('/pantry', passportConfig.isAuthenticated, async (req, res) => {
	if (!req.user) { return res.status(400).end() }
	return res.status(200).json(req.user.pantry).end()
})

// DELETE user
router.delete('/profile', passportConfig.isAuthenticated, async (req, res) => {
	const data = await User.findOneAndDelete({name: req.user.name})
	if (!data) { return res.status(500).json({}).end() }

	req.logout()
	return res.status(200).json({}).end()
})

// GET user
router.get('/profile', passportConfig.isAuthenticated, async (req, res) => {
	const data = await User
		.findOne({name: req.user.name}, 'name recipes pantry')
		.populate('recipes', 'name').lean()

	return res.status(200).json(data).end()
})

router.get('/profile/createAllowed', (req, res) => {
	res.status(200).json({
		'allowed': process.env.ALLOW_ACCOUNT_CREATION,
	}).end()
})

router.post('/profile/create', async (req, res, next) => {
	if (!process.env.ALLOW_ACCOUNT_CREATION) {
		return res.status(400).end({ msg: 'Account creation is not allowed' })
	}

	if (await User.findOne({ name: req.body.username })) {
		return res.status(400).json({ msg: 'Name already exists' }).end()
	}

	const user = new User({
		name: req.body.username,
		password: req.body.password,
	})

	user.save((err) => {
		if (err) { return next(err) }

		req.logIn(user, async (err) => {
			if (err) { return res.status(500).json({}).end() }

			// recipes doesn't need to be populated because it's an empty list
			const data = await User
				.findOne({name: user.name}, 'name recipes pantry').lean()

			return res.status(200).json(data).end()
		})
	})
})

router.post('/profile/change', passportConfig.isAuthenticated, async (req, res) => {
	const user = req.user
	user.password = req.body.newPass

	try {
		await user.validate()
	} catch (err) {
		return res.status(400).json({}).end()
	}

	try {
		await user.save()
	} catch (err) {
		return res.status(500).json({}).end()
	}

	return res.status(200).json({}).end()
})

router.get('/profile/logout', passportConfig.isAuthenticated, (req, res) => {
	req.logout()
	return res.status(200).json({}).end()
})

router.get('/profile/recipes', passportConfig.isAuthenticated, async (req, res) => {
	const user = await User
		.findById(req.user._id, 'recipes')
		.populate('recipes', 'name').lean()

	if (!user.recipes) { res.status(500).json({}).end() }
	return res.status(200).json(user.recipes).end()
})


// PANTRY ======================================================================


// POST Add/update pantry item
router.post('/pantry', passportConfig.isAuthenticated, async (req, res) => {
	const data = util.getPantryItem(req)

	if (!data._id) {
		try {
			await User.findByIdAndUpdate(req.user._id, {
				$push: { pantry: data }
			}, { runValidators: true })

			return res.status(200).json({}).end()
		} catch (_) {
			return util.send400(res, `Could not add ${data.name}`)
		}
	}

	try {
		await User.updateOne({'pantry._id': data._id}, {
			$set: {
				'pantry.$.amount': data.amount,
				'pantry.$.name': data.name,
				'pantry.$.unit': data.unit,
			}
		}, { runValidators: true, upsert: true })

		return res.status(200).json({}).end()
	} catch (e) {
		return util.send400(res, `Could not update ${data.name}`)
	}
})


// RECIPE ======================================================================


// Delete a recipe
router.delete('/recipe/:id', passportConfig.isAuthenticated, async (req, res) => {
	const id = req.params.id
	const recipe = await Recipe.findById(id).lean()
	if (!recipe) { return util.send400(res, `No recipe ${id}`) }

	let result = await User.updateOne(
		{ _id: req.user._id },
		{ $pull: { recipes: id } },
	)
	if (!result) { return res.status(500).json({}).end() }

	result = await Recipe.deleteOne({_id: id})
	if (!result) { return res.status(500).json({}).end() }

	return res.status(200).json({}).end()
})


// Receive search request
router.get('/recipe', async (req, res) => {
	let term = req.query.t
	term = term.trim()
	term = term.replace(/\s+/gi, ' ')

	const ret = []
	const recipes = await Recipe.find({
		$or: [
			{ name: new RegExp(term, 'i') },
			{ 'ingredients.name': new RegExp(term, 'i') },
		]
	}).lean()

	for (const recipe of recipes) {
		const user = await User.findOne({ 'recipes': recipe._id }, 'name')
			.lean()

		if (user) {
			recipe.ownerID = user._id
			recipe.ownerName = user.name
			ret.push(recipe)
		}
	}

	return res.status(200).json(ret).end()
})


// Get a specific recipe
router.get('/recipe/:id', async (req, res) => {
	const id = req.params.id
	const recipe = await Recipe.findById(id).lean()
	if (!recipe) {
		return res.status(400).json({ msg: `Recipe ${id} not found` }).end()
	}

	return res.status(200).json(recipe).end()
})


// Add a recipe
router.post('/recipe', passportConfig.isAuthenticated, async (req, res) => {
	const recipe = req.body

	const ingredients = []
	for (const ingredient of recipe.ingredients) {
		const newIngredient = {
			amount: Number(ingredient.amount),
			name: ingredient.name,
			note: ingredient.note || '',
			prep: ingredient.prep || '',
			unit: ingredient.unit,
		}
		ingredients.push(newIngredient)
	}

	const newRecipe = new Recipe({
		directions: recipe.directions,
		ingredients: ingredients,
		name: recipe.name,
	})

	const err = newRecipe.validateSync()
	if (err) { return util.send400(res, 'Invalid recipe format') }

	try {
		await newRecipe.save()
	} catch (err) {
		return res.status(500).json({}).end()
	}

	const result = await User.findByIdAndUpdate(req.user._id, {
		$push: { recipes: newRecipe._id}
	})

	if (!result) { return res.status(500).json({}).end() }

	return res.status(200).json({}).end()
})


// Edit a recipe
router.post('/recipe/edit', passportConfig.isAuthenticated, async (req, res) => {
	const recipe = req.body

	// Check that the user owns the recipe
	const user = await User.findById(req.user._id, 'recipes')
		.populate('recipes', 'name').lean()

	if (!user) { return res.status(500).json({}).end() }

	const matches = user.recipes.filter((_recipe) => _recipe._id === recipe._id)
	if (!matches) {
		return util.send400(res, `Recipe "${recipe.name}" not owned`)
	}

	// Modify the recipe
	const err = new Recipe(recipe).validateSync()
	if (err) { return util.send400(res, `Recipe "${recipe.name}" format`) }

	const result = await Recipe.findByIdAndUpdate(recipe._id, recipe)
	if (!result) {
		return util.send400(res, `Could not find recipe "${recipe.name}"`)
	}

	return res.status(200).json({}).end()
})

module.exports = router
