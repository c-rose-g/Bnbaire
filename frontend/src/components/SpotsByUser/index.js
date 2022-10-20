import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Redirect, useParams } from 'react-router-dom';
import { thunkLoadSpotsByUser } from '../../store/allSpots';
import './SpotsByUser.css';

function SpotsByUser() {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.session.user);
	console.log('this is user in SpotsByUser comp',userId)
	const spots = useSelector((state) => Object.values(state.spots.allSpots));
	console.log('this is spots USESELECTOR in SpotByUser comp', spots);
	// const spots = useSelector(state => state.session.allSpots)
	// console.log('spots in spot details',spots)
	// const manageSpots = (e) =>{
	//   e.preventDefault();

	//   dispatch(thunkLoadSpotsByUser())

	// }
	useEffect(() => {
		dispatch(thunkLoadSpotsByUser());
	}, [dispatch]);
	// if(!spots?.id){
		//   return null;
		// }
		if(!userId){
			return(
				<Redirect to='/' />
			)
		}
	if(spots.length < 1){
		return(
			<>
				<h1 className='no-spots-message'>you have no spots</h1>
			</>
		)
	}
	return (
		<>

		<div className='spots-container'>
			<h1> {spots.name}</h1>
			{spots.map((spot) => {
				return (
					<NavLink key={spot.name} to={`/spots/${spot.id}`}>
						<div id="user-spot-card">
							<div className="img-card">
								<img src={spot?.previewImage} alt="spot image"></img>
							</div>
							<div className="spot-text">
							{spot.description}
								<div id="user-top-spot-text">
									<h2>
										{spot.city}, {spot.state}
									</h2>
									<h2>★{spot.avgRating}</h2>
								</div>
								<h2>${spot.price} </h2>

							</div>
						</div>

					</NavLink>
				);
			})}
		</div>
		</>
	);
}

export default SpotsByUser;
