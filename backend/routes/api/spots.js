const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
const {
	Spot,
	Review,
	SpotImage,
	User,
	Booking,
	ReviewImage,
	sequelize,
} = require('../../db/models');

// const { check } = require('express-validator');
// const { handleValidationErrors } = require('../../utils/validation');

// add express validator here

// EDIT A SPOT (yes auth)
// NOTE add error validator (400)
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

// NOTE  DELETE A SPOT (yes auth, yes authorization) - spot must belong to current user
router.delete('/:spotId', requireAuth, async (req, res) => {
	const { spotId } = req.params;
	const spotByPk = await Spot.findByPk(spotId);
	if (!spotByPk) {
		return res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}

	spotByPk.destroy();
	return res.status(200).json({
		message: 'Successfully deleted',
		statusCode: 200,
	});
});

// ANCHOR CREATE A BOOKING FROM A SPOT BASED ON THE SPOT'S ID -try with spot owner login
router.post('/:spotId/bookings', requireAuth, async (req, res) => {
	const { spotId } = req.params;
	const { startDate, endDate } = req.body;
	const spot = await Spot.findByPk(spotId);
	if (!spot) {
		return res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}

	if (startDate > endDate) {
		return res.status(400).json({
			message: 'Validation error',
			statusCode: 400,
			errors: {
				endDate: 'endDate cannot be on or before startDate',
			},
		});
	}
	const spotBooking = await Booking.findOne({
		where: {
			spotId: spot.id,
			[Op.or]:[{
				startDate:{
					[Op.between]:[startDate,endDate]
				},
				endDate:{
					[Op.between]:[startDate, endDate]
				}
			}]
		},
	});
	// console.log("spot booking",spotBooking)

	let newEnd = new Date(endDate);
	let newStart = new Date(startDate);
	// let bookingArray = [];


		if (spot && spotBooking){
			return res.status(403).json({
				message: 'Sorry, this spot is already booked for the specified dates',
				statusCode: 403,
				errors: {
					startDate: 'Start date conflicts with an existing booking',
					endDate: 'End date conflicts with an existing booking',
				},
			});
		}

	// ((booking.startDate<=newStart && booking.endDate<=newEnd)||(booking.startDate<=newStart)||(booking.endDate>=newEnd))
	// else {
	const newBooking = await Booking.create({
		spotId: spot.id,
		userId: req.user.id,
		startDate,
		endDate,
	});
	return res.status(200).json(newBooking);
	// }

	// try {
	// if (req.user.id === spot.ownerId) {
	// } else {
	// 	return res.status(403).json({
	// 		message: 'Forbidden',
	// 		statusCode: 403,
	// 	});
	// }
	// } catch {

	// }
});

// ADD AN IMAGE TO A SPOT BASED ON THE SPOT'S ID (yes auth(logged in), yes authorization(user role/set of user permissions))
// NOTE double check error validation
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
	const { url, preview } = req.body;
	const { spotId } = req.params;
	const spot = await Spot.findByPk(spotId);

	if (!spot) {
		return res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	} else {
		const spotImages = await SpotImage.findAll({
			where: {
				spotId: spot.id,
			},
			attributes: [
				[sequelize.fn('COUNT', sequelize.col('id')), 'spotImagesCount'],
			],
		});

		if (spotImages.spotImagesCount === 10) {
			return res.status(403).json({
				message: 'Maximum number of images for this resource was reached',
				statusCode: 403,
			});
		}
		// try {
		if (spot.ownerId === req.user.id) {
			let spotImage = await SpotImage.create({
				spotId: spot.id,
				url,
				preview: true,
			});

			let image = spotImage.toJSON();
			delete image.spotId;
			// delete image.preview;
			delete image.createdAt;
			delete image.updatedAt;

			return res.status(200).json(image);
		} else {
			// } catch {
			return res.status(403).json({
				message: 'Forbidden',
				statusCode: 403,
			});
		}
	}
	// }
});

// NOTE double check after deleting db
// FIXME add error validator (400)
// {
//   "message": "Validation error",
//   "statusCode": 400,
//   "errors": {
//     "review": "Review text is required",
//     "stars": "Stars must be an integer from 1 to 5",
//   }
// }
// CREATE A review FOR A SPOT BASED ON THE SPOT'S ID
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
	const { spotId } = req.params;
	const { review, stars } = req.body;
	const spot = await Spot.findByPk(spotId);

	if (!spot) {
		return res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
	const userSpotReview = await Review.findOne({
		where: {
			spotId: spot.id,
			userId: req.user.id,
		},
	});
	if (userSpotReview) {
		return res.status(403).json({
			message: 'User already has a review for this spot',
			statusCode: 403,
		});
	}
	try {
		const newReview = await Review.create({
			userId: req.user.id,
			spotId: spot.id,
			review,
			stars,
		});
		return res.status(201).json(newReview);
	} catch {
		res.json({
			message: 'validatorError',
			statusCode: 400,
		});
	}
});

// NOTE do i need to change LAT/LNGto numbers?
// FIXME error validation
// CREATE A SPOT (yes auth)
router.post('/', requireAuth, async (req, res) => {
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;

	// try {
	if (req.body) {
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
		return res.status(201).json(newSpot);
	}
	// } catch {
	// 	return res.status(400).json({
	// 		message: 'Validation Error',
	// 		statusCode: 400,
	// 		errors: {
	// 			address: 'Street address is required',
	// 			city: 'City is required',
	// 			state: 'State is required',
	// 			country: 'Country is required',
	// 			lat: 'Latitude is not valid',
	// 			lng: 'Longitude is not valid',
	// 			name: 'Name must be less than 50 characters',
	// 			description: 'Description is required',
	// 			price: 'Price per day is required',
	// 		},
	// });
	// }
});

// GET ALL BOOKINGS FOR A SPOT BASED ON THE SPOT'S ID
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
	const { spotId } = req.params;
	const spot = await Spot.findByPk(spotId);
	if (!spot) {
		return res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
	// if spot belongs to the owner
	if (spot.ownerId === req.user.id) {
		const ownerBookings = await Booking.findAll({
			where: {
				spotId: spot.id,
			},
			include: {
				model: User,
				attributes: ['firstName', 'lastName', 'id'],
			},
		});

		return res.status(200).json({ Bookings: ownerBookings });
	} else {
		const currUserBookings = await Booking.findAll({
			where: {
				userId: req.user.id,
				spotId: spot.id,
			},
			attributes: ['spotId', 'startDate', 'endDate'],
		});
		return res.status(200).json({ Bookings: currUserBookings });
	}
});

//  GET ALL reviews BY A SPOT'S ID
// NOTE should i change stars to single digits?
router.get('/:spotId/reviews', async (req, res) => {
	// const { spotId } = req.params;
	const spot = await Spot.findByPk(req.params.spotId);
	if (!spot) {
		return res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
	const allReviews = await Review.findAll({
		include: [
			{
				model: User,
				attributes: ['id', 'firstName', 'lastName'],
			},
			{
				model: ReviewImage,
				attributes: ['id', 'url'],
			},
		],
		where: {
			spotId: req.params.spotId,
		},
	});

	// let array = []
	// for(let review of allReviews){
	// 	let reviewJSON = review.toJSON()
	// 	console.log(reviewJSON)
	// 	let star = parseFloat(reviewJSON.stars.toFixed(0))
	// 	reviewJSON.stars = star;
	// 	array.push(reviewJSON)
	// }

	res.status(200).json({ Reviews: allReviews });
});

// GET ALL SPOTS OWNED BY THE CURRENT USER (yes auth)
// NOTE do I need to change LAT/LNG/PRICE ?
router.get('/current', requireAuth, async (req, res) => {
	const allSpots = await Spot.findAll({
		include: { model: SpotImage, where: { preview: true } },
		where: {
			ownerId: req.user.id,
		},
	});
	let spots = [];
	// console.log('this is spots by current user in the backend route', allSpots)
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
		spots.push(spot);
	}
	// console.log('this is spots array in backend route', spots)
	res.status(200).json({ Spots: spots });
});

// const findAllSpots = await Spot.findAll()
// console.log('this is all spots in backend', findAllSpots)
// const existingSpot = await Spot.findByPk(spotId, {
// 	include: [
// 		{model: SpotImage,where: {preview: true,
// 			},
// 		},
// 		{
// 			model: User,
// 			as: 'Owner',
// 			attributes: ['id', 'firstName', 'lastName'],
// 		},
// 	],
// });
// } else {
// 	const allSpots = await Spot.findAll({
		// include: [
		// 	{
		// 		model: SpotImage,
		// 		where: {
		// 			preview: true,
		// 		},
		// 	},
		// 	{
		// 		model: User,
		// 		as: 'Owner',
		// 		attributes: ['id', 'firstName', 'lastName'],
		// 	},
		// ],
// 		where: {
// 			id: +spotId,
// 		},
// 	});
	// let spotArray = [];
//GET DETAILS OF A SPOT FROM AN ID (no auth)
router.get('/:spotId', async (req, res) => {
	// const { spotId } = req.params;
	let spot = await Spot.findByPk(req.params.spotId, {
		include: [{
				model: SpotImage,
				attributes: ['id', 'url', 'preview']
		},{
				model: User,
				as: 'Owner',
				attributes: ['id', 'firstName', 'lastName']
		}]
});
	// console.log('get existing spots',spot.toJSON())
	if (!spot) {
		res.status(404).json({
			message: "Spot couldn't be found",
			statusCode: 404,
		});
	}
		// for (let spotObj of spot) {
			spot = spot.toJSON();
			// console.log('spots json', spot)
			let rating = await Review.findAll({
				raw: true, //turns it into a POJO ONLY LAZY LOADING
				where: {
					spotId: spot.id,
				},
				attributes: [
					[sequelize.fn('COUNT', sequelize.col('review')), 'numReviews'],
					[sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating'],
				],
			});

			// console.log('rating',rating[0].toJSON().numReviews)
			let reviews = +rating[0].numReviews;
			spot.numReviews = reviews;
			spot.price = +spot.price;
			spot.avgStarRating = +rating[0].avgStarRating;
			// spot.push(spotObj);
			// console.log('spotObj',spotObj)
			// spotObj.numReviews = rating[0].toJSON().numReviews

		console.log('this is spots in backend route',spot)
		res.status(200).json(spot);
	// }
});

// NOTE do I need to test on a spot w/o reviews / stars ?
// NOTE do i need to change LAT/LNG/PRICE to numbers, and do I need to remove the decimals from price?
//  GET ALL SPOTS (no auth)
router.get('/', async (req, res) => {
	let { page, size } = req.query;
	page =
		page === undefined ? 1 : page < 0 ? 1 : page > 10 ? 10 : parseInt(page);
	size =
		size === undefined ? 20 : size < 0 ? 1 : size > 20 ? 20 : parseInt(size);

	let allSpots = await Spot.findAll({
		include: [{
			model: SpotImage,
			attributes: ['id', 'url', 'preview']
		}],
		limit: size,
		offset: size * (page - 1),
	});

	// console.log('this is all spots', allSpots[0].SpotImages)
	// console.log('this is size', page)
	//  toJSON on each spot, key into review and spotimage, test on spot w/o reviews/stars
	let spots = [];
	for (let spot of allSpots) {
		spot = spot.toJSON();
		const rating = await Review.findAll({
			where: {
				spotId: spot.id,
			},
			attributes: [[sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']],
		});
		// console.log('this is rating',rating)
		spot.avgRating = Number(rating[0].toJSON().avgRating);
		// TODO add conditional;
		// if(!spot.previewImage){
		// 	spot.previewImage = null
		// }else {
			// spot.previewImage = spot.SpotImages[0].url;
			// delete spot.SpotImages;
			spots.push(spot);
		// }
	}
	// console.log('spots ', spots)
	res.status(200).json({ Spots: spots, page, size });
});

module.exports = router;
