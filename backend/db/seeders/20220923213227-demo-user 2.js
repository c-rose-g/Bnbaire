'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			'Users',
			[
				{
					email: 'demo1@aa.io',
					username: 'Cece1',
					hashedPassword: bcrypt.hashSync('password1'),
				},
				{
					email: 'demo2@aa.io',
					username: 'Cece2',
					hashedPassword: bcrypt.hashSync('password2'),
				},
				{
					email: 'demo3@aa.io',
					username: 'Cece3',
					hashedPassword: bcrypt.hashSync('password3'),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			'Users',
			{
				username: { [Op.in]: ['Cece1', 'Cece2', 'Cece3'] },
			},
			{}
		);
	},
};
