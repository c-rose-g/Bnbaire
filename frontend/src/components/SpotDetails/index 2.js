// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Redirect, useHistory, useParams } from 'react-router-dom';
// import { NavLink } from 'react-router-dom';
// import { deleteSpot, thunkLoadSingleSpot, thunkLoadSpots } from '../../store/allSpots';
// import { loadReviewsBySpotThunk } from '../../store/reviews';
// import './SpotDetails.css';
// // import DeleteWarningModal from '../DeleteSpotModal';
// // import { Modal } from '../../context/Modal';
// import '../DeleteSpotModal/DeleteSpotModal.css'

// function SingleSpot() {
// 	const { spotId } = useParams();
// 	const history = useHistory()
// 	const dispatch = useDispatch();
// 	const spot = useSelector((state) => state.spots.singleSpot);
// 	// console.log('this is spot use selector in SINGLE SPOT', spot)
// 	const userSelector = useSelector((state) => state.session.user);
// 	const reviews = useSelector(state => Object.values(state.reviews.spot))
// 	console.log('this is reviews state in SINGLE SPOT', reviews)
//   // const [showModal, setShowModal] = useState(false);
//   // const openModal = () =>{setShowModal(true)}
// 	// const warningSubmit = (e) => {e.preventDefault()return (<><DeleteWarningModal /></>)};
// 	let spotUpdateButton;
// 	let spotDeleteButton;
// 	useEffect(() => {
// 		dispatch(thunkLoadSingleSpot(spotId));
// 		dispatch(loadReviewsBySpotThunk(spotId));
// 		// console.log('this is state inSingleSpot', spot);
// 		// if(reviews.length <1){
// 		// 	return (
// 		// 		<>
// 		// 			<h2>this spot has no reviews</h2>
// 		// 		</>
// 		// 	)
// 		// }
// 	}, [dispatch]);

// 	const handleCancel = (e) =>{
// 		e.preventDefault()
// 		dispatch(deleteSpot(spotId))

// 		history.push('/')

// 	}
// 	if (userSelector && userSelector.id === spot.ownerId) {
// 		spotUpdateButton = (
// 			<NavLink to={`/my-spots/update/${spotId}`}>
// 				<button>Update Spot</button>
// 			</NavLink>
// 		);
// 		spotDeleteButton = (
// 		<button onClick={handleCancel}>Delete a spot</button>
// 		)
// 	}

// 	if(userSelector && spot.ownerId === null){
// 		// return(
// 		// 	<>
// 		// 	<Redirect to='/'/>
// 		// 	</>
// 		// )
// 		history.push('/')
// 	}
// 	// console.log('this is spot in SingleSpot', spot);
// 	// console.log('this is the spot id', spotId);
// 	// const spot = spotsSelector.find((spot) => spot.id === +spotId);
// 	// should this be a validation error or optional chaining?
// 	// what to do when its loading stuff from the thunk?
// 	// added chaining in the return
// 	if (!spot?.id) {
// 		return null;
// 	}


// 	return (
// 		// <NavLink to='/spots/update-spot'></NavLink>
// 		<>

// 		<div className='page-container'>
// 		<div id="current-spot-container">
// 			<h1>{spot.name}</h1>

// 			<div className="spot-card">
// 				<div className="img-card">
// 					{spot.SpotImages && spot.SpotImages.length && (
// 						<img src={spot.SpotImages[0].url} alt="preview"></img>
// 					)}
// 				</div>
// 				{/* <div className="spot-text">
// 					<div className="top-spot-text">
// 						<h2>
// 							{spot.city}, {spot.state}
// 						</h2>
// 						<h2>★{spot.avgRating}</h2>
// 					</div>
// 					<h2>{spot.description}</h2>
// 					<h2>${spot.price} </h2>
// 				</div> */}
// 					{/* {spotUpdateButton}
// 					{spotDeleteButton} */}
// 		</div>
// 		<div className='reviews-container'>
// 		<div className='reviews-card'>
// 			{/* <h2> this is where the reviews will go</h2> */}
// 			{/* {reviews.length < 0 && ('this spot has no reviews')} */}
// 			{reviews.map(review => {

// 				return(
// 					<div className='review-card' key={review.id}>
// 					<div className='review-user-stars'>

// 					{review.User.firstName}
// 					{review.stars} stars
// 					</div>
// 					<p/>
// 						{review.review}
// 					</div>
// 				)
// 			})}
// 		</div>
// 			</div>

// 		</div>

// 		<fieldset>
// 		<div className="spot-text">
// 					<div className="top-spot-text">
// 						<h2>
// 							{spot.city}, {spot.state}
// 						</h2>
// 						<h2>★{spot.avgRating}</h2>
// 					</div>
// 					<h2>{spot.description}</h2>
// 					<h2>${spot.price} </h2>
// 				</div>
// 		</fieldset>
// 		</div>
// 		</>
// 	);
// }

// export default SingleSpot;