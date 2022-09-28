const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const user = require('../../db/models/user');

// const { check } = require('express-validator');
// const { handleValidationErrors } = require('../../utils/validation');

// add express validator here

// EDIT A SPOT (yes auth)
router.put('/:spotId', async (req, res) => {
	const { spotId } = req.params;
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;

	const spot = await Spot.findByPk(spotId);
	if (spot) {
		spot.update({
			address,
			city,
			state,
			country,
			lat,
			lng,
			name,
			description,
			price,
		});

		return res.status(200).json(spot);
	} else {
		res.status(404);
		return res.json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
});

// DELETE A SPOT (yes auth, yes authorization)
router.delete('/:spotId', requireAuth, async (req, res) => {
	const { spotId } = req.params;
	if (spotId) {
		const spot = await Spot.findByPk(spotId);
		spot.destroy();
		res.status(200).json({
			message: 'Successfully deleted',
			statusCode: 200,
		});
	}
});
// CREATE A REVIEW FOR A SPOT BASED ON THE SPOT'S ID
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
	const { spotId } = req.params;
	const { review, stars } = req.body;

	if (spotId) {
		const reviews = await Review.findOne({
			where: {
				spotId: spotId,
			},
		});
		const newReview = await reviews.create({ review: review, stars: stars });
		res.status(200).json(newReview);
	} else {
		res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
});

// ADD AN IMAGE TO A SPOT BASED ON THE SPOT'S ID (yes auth(logged in), yes authorization(user role/set of user permissions))
router.post('/:spotId/Images', requireAuth, async (req, res) => {
	const { url, preview } = req.body;
	const { spotId } = req.params;
	if (spotId) {
		const spot = await Spot.findByPk(spotId);
		if (!spot) {
			res.status(404);
			return res.json({
				message: "Spot couldn't be found",
				statusCode: 404,
			});
		} else {
			let spotImage = await SpotImage.create({
				spotId: spotId,
				url,
				preview,
			});

			let image = spotImage.toJSON();
			delete image.spotId;
			delete image.preview;
			delete image.createdAt;
			delete image.updatedAt;

			res.status(200).json(image);
		}
	}
});

// CREATE A SPOT (yes auth)
router.post('/', requireAuth, async (req, res) => {
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;

	const newSpot = await Spot.create({
		ownerId: req.user.id,
		address,
		city,
		state,
		country,
		lat,
		lng,
		name,
		description,
		price,
	});

	res.status(201).json(newSpot);
});

// GET ALL REVIEWS BY A SPOT'S ID
router.get('/:spotId/reviews', async (req, res) => {
	const { spotId } = req.params;
	if (spotId) {
		const Reviews = await Review.findAll();
		res.status(200).json({ Reviews });
	} else {
		res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
});

// GET ALL SPOTS OWNED BY THE CURRENT USER (yes auth)
router.get('/current', requireAuth, async (req, res) => {
	const allSpots = await Spot.findAll({
		include: [
			{
				model: SpotImage,
				where: {
					preview: true,
				},
			},
      { model: User, as:'Owners'}
		],
		where: {
			ownerId: req.user.id,
		},
	});
	let spots = [];
	for (let spot of allSpots) {
		spot = spot.toJSON();
		const rating = await Review.findAll({
			where: {
				userId: req.user.id,
			},
			attributes: [
				[sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating'],
			],
		});

		spot.avgStarRating = rating[0].toJSON().avgStarRating;
		// console.log('rating', rating[0].toJSON().avgRating);
		spots.push(spot);
	}

	res.status(200).json({ spots });
});

//GET DETAILS OF A SPOT FROM AN ID (no auth)
router.get('/:spotId', async (req, res) => {
	const { spotId } = req.params;
	const getAllSpots = await Spot.findAll();
	// console.log('get all spots',getAllSpots)
	if (getAllSpots.includes(spotId)) {
		const allSpots = await Spot.findAll({
			include: [
				{
					model: SpotImage,
					where: {
						preview: true,
					},
				},
				{
					model: User,
					as: 'Owners',
					attributes: ['id', 'firstName', 'lastName'],
				},
			],
			where: {
				id: spotId,
			},
		});
		let spot = [];
		for (let spotObj of allSpots) {
			spotObj = spotObj.toJSON();
			const rating = await Review.findAll({
				where: {
					spotId: spotObj.id,
				},
				attributes: [
					[sequelize.fn('COUNT', sequelize.col('review')), 'numReviews'],
				],
			});
			// console.log('rating',rating[0].toJSON().numReviews)
			let reviews = rating[0].toJSON().numReviews;
			spotObj.numReviews = reviews;
			spot.push(spotObj);
			// console.log('spotObj',spotObj)
			// spotObj.numReviews = rating[0].toJSON().numReviews
		}
		res.status(200).json(...spot);
	} else {
		res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
});

// GET ALL SPOTS (no auth)
router.get('/', async (req, res) => {
	const allSpots = await Spot.findAll({
		include: {
			model: SpotImage,
			where: {
				preview: true,
			},
		},
	});

	// toJSON on each spot, key into review and spotimage, test on spot w/o reviews/stars
	let Spots = [];
	for (let spot of allSpots) {
		spot = spot.toJSON();
		const rating = await Review.findAll({
			where: {
				spotId: spot.id,
			},
			attributes: [[sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']],
		});

		spot.avgRating = Number(rating[0].toJSON().avgRating);
		spot.previewImage = spot.SpotImages[0].url;
		delete spot.SpotImages;
		Spots.push(spot);
	}

	res.status(200).json({Spots});
});

module.exports = router;
