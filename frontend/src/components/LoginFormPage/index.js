// frontend/src/components/LoginFormPage/index.js
import React, { useEffect, useReducer, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import './LoginForm.css';

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector(state => state.session.user);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [frontEndErrors, setFrontEndErrors] = useState([])

  if (sessionUser) return (
    <Redirect to="/" />
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    const login= dispatch(sessionActions.login({ credential, password }))
      .catch(async (res) => {
        const data = await res.json();
        console.log('the data', data)
        if (data && data.errors) setErrors(data.errors);
      });
      console.log('login data', login)
  }

  return (
    <form onSubmit={handleSubmit} key={idx}>
      <ul>
        {errors.map((error) => <li>{error}</li>)}
      </ul>
      <label>
        Username or Email
        <input
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <div className='login-button-div'>
      <button className='login-button' type="submit">Log In</button>
      </div>
    </form>
  );
}

export default LoginFormPage;
