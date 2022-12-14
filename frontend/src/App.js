// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
// import SignupFormPage from "./components/SignupFormPage";
import Navigation from "./components/Navigation";
import AllSpots from "./components/AllSpots";
import * as sessionActions from "./store/session";
import * as SpotActions from './store/allSpots'
import SingleSpot from './components/SpotDetails'
import CreateSpot from "./components/CreateSpot";
import SpotsByUser from "./components/SpotsByUser";
import UpdateSpot from "./components/UpdateSpot";
import CreateReview from "./components/CreateReview";
import UpdateReview from "./components/UpdateReview";
import DeleteReview from "./components/DeleteReview";
function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          {/* <Route path="/signup">
            <SignupFormPage />
          </Route> */}
          <Route exact path='/'>
          <AllSpots />
           </Route>
          <Route exact path='/create-spot'>
            <CreateSpot/>
          </Route>
          <Route exact path='/spots/:spotId' >
            <SingleSpot />
          </Route>
          <Route exact path='/my-spots/current'>
            <SpotsByUser />
          </Route>
          <Route path='/my-spots/update/:spotId'>
            <UpdateSpot />
          </Route>
          <Route path='/spots/:spotId/reviews'>
          <CreateReview />
          </Route>
          <Route exact path='/reviews/:reviewId'>
            <UpdateReview />
          </Route>
          <Route path='/reviews/:reviewId'>
          <DeleteReview />
          </Route>
          <Route>Page not found.</Route>
        </Switch>
      )}
    </>
  );
}

export default App;
