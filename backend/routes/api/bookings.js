const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Booking, User, Spot, SpotImage } = require('../../db/models');
const sequelize = require('sequelize');
// GET ALL OF THE CURRENT USER'S BOOKINGS
router.get('/current', requireAuth, async (req, res) => {
	const currBookings = await Booking.findAll({
		include: {
			model: Spot,
			attributes: {
				exclude: ['description', 'createdAt', 'updatedAt'],
			},
		},
		where: {
			userId: req.user.id,
		},
	});
	let bookings = [];

	for (let booking of currBookings) {
		let bookingJSON = booking.toJSON();

		const spotImage = await SpotImage.findByPk(booking.id, {
			where: {
				preview: true,
			},
		});
		if (spotImage !== null) {
			let spotImageJSON = spotImage.toJSON();

			bookingJSON['Spot'].previewImage = spotImageJSON.url;
		}
		bookings.push(bookingJSON);
		// console.log(bookings)
	}
	return res.status(200).json({ Bookings: bookings });
});
//
// NOTE EDIT A BOOKING - check with a different login
// REVIEW submit to heroku and try again
router.put('/:bookingId', requireAuth, async (req, res) => {
	const { bookingId } = req.params;
	let { startDate, endDate } = req.body;

	const bookingByPk = await Booking.findByPk(bookingId);

	console.log('BOOKING BY PK:', bookingByPk);
	if (!bookingByPk) {
		return res.status(404).json({
			message: "Booking couldn't be found",
			statusCode: 404,
		});
	} else {
		// startDate can't come before endDate
		if (startDate > endDate) {
			return res.status(400).json({
				message: 'Validation error',
				statusCode: 400,
				errors: {
					endDate: 'endDate cannot come before startDate',
				},
			});
		}
		// can't update ongoing bookings
		if (endDate > bookingByPk.endDate) {
			return res.status(403).json({
				message: "Past bookings can't be modified",
				statusCode: 403,
			});
		}
		// try {
		if (req.user.id === bookingByPk.userId) {
			await bookingByPk.update({
				startDate: startDate,
				endDate: endDate,
			});
			return res.status(200).json(bookingByPk);
		}
		// } catch {
		else {
			res.status(403).json({
				message: 'Forbidden',
				statusCode: 403,
			});
		}
		// }
	}
});

// NOTE DELETE A BOOKING, must belong to current user or spot must belong to current user
// FIXME add to heroku and try again.
router.delete('/:bookingId', requireAuth, async (req, res) => {
	const { bookingId } = req.params;
	const bookingByPk = await Booking.findByPk(bookingId);

	if (!bookingByPk) {
		return res.status(404).json({
			message: "Booking couldn't be found",
			statusCode: 404,
		});
	}
	bookingByPk.destroy();
	return res.status(200).json({
		message: 'Successfully deleted',
		statusCode: 200,
	});
});

module.exports = router;
