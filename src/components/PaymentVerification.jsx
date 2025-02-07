import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';

const PaymentVerification = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  const sendVerificationEmail = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      alert('User email not found. Please register again.');
      return;
    }
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);

    const templateParams = {
      user_email: email,
      message: `Your payment verification code is: ${generatedCode}`
    };

    try {
      await emailjs.send('service_uxk9td9', 'template_gins08q', templateParams, 'gtjQ3vwclQQbvVLlt');
      alert('Verification email sent!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send verification email.');
    }
  };

  const handleSubmitPayment = async () => {
    setShowVerification(true);
    await sendVerificationEmail();
  };

  const handleVerification = async () => {
    if (enteredVerificationCode !== verificationCode) {
      alert('Incorrect verification code');
      return;
    }

    const userId = localStorage.getItem('user');
    console.log(userId)
    try {
      await axios.post('http://localhost:5000/api/membership/', { userId });
      alert('Payment verified successfully! Membership activated.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  return (
    <div className='payment-verification'>
      <h2>Payment Verification</h2>
      <input type="text" placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
      <input type="text" placeholder="Expiry Date (MM/YY)" value={expDate} onChange={e => setExpDate(e.target.value)} required />
      <input type="text" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} required />
      <button onClick={handleSubmitPayment}>Submit Payment</button>

      {showVerification && (
        <div>
          <h3>Enter Verification Code</h3>
          <input type="text" placeholder="Verification Code" value={enteredVerificationCode} onChange={e => setEnteredVerificationCode(e.target.value)} required />
          <button onClick={handleVerification}>Verify</button>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
