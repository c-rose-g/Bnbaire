
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Spot extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Spot.belongsTo(models.User, { foreignKey: 'ownerId', as:'Owner' });
			Spot.hasMany(models.Review, { foreignKey: 'spotId' });
			Spot.hasMany(models.Booking, { foreignKey: 'spotId' });
			Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });
		}
	}
	Spot.init(
		{
			id:{
				type:DataTypes.INTEGER,
				autoIncrement:true,
				primaryKey:true
			},
			ownerId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				onDelete: 'CASCADE',
			},
			address: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			city: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			state: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			country: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lat: {
				type: DataTypes.DECIMAL(9, 7),
				validate: {
					min: -90,
					max: 90,
				},
			},
			lng: {
				type: DataTypes.DECIMAL(10, 7),
				validate: {
					min: -180,
					max: 180,
				},
			},
			name: {
				type: DataTypes.STRING(50),
				allowNull: false,
				validate: {
					len: [1, 50],
				},
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			price: {
				type: DataTypes.DECIMAL(5, 2),
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'Spot',

		}
	);
	return Spot;
};
