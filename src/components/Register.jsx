import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/auth/register', { name, email, password });
      localStorage.setItem('userEmail', email);
      alert('Registration successful! Proceed to payment.');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className='register--form'>
      <h2>Register</h2>
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
