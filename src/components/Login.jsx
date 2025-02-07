import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', res.data.user.isAdmin);
      localStorage.setItem('user', res.data.user._id);
      localStorage.setItem('userEmail', res.data.user.email);
      setMessage('Login successful');
      navigate('/admindashboard'); 
    } catch (err) {
      setMessage('Invalid credentials or email not verified');
    }
  };
  const RedirectToRegister = async () => {
    navigate('/register')
  }
  return (
    <div className='login--form'>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <p>{message}</p>
      <button onClick={handleLogin}>Login</button>
      <button onClick={RedirectToRegister}>Register</button>
    </div>
  );
};

export default Login;
