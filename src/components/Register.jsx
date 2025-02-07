import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const navigate = useNavigate();

  const sendVerificationEmail = async () => {
    if (!email) {
      alert('Please enter an email address first.');
      return;
    }
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);

    const templateParams = {
      user_email: email,
      message: `Your payment verification code is: ${generatedCode}`
    };

    try {
      await emailjs.send(
        'service_uxk9td9', 
        'template_gins08q', 
        templateParams, 
        'gtjQ3vwclQQbvVLlt'
      );
      alert('Verification email sent!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send verification email.');
    }
  };

  const sendInvoiceEmail = async () => {
    const date = new Date().toLocaleDateString();
    const priceHT = 20.00;
    const TVA = priceHT * 0.20;
    const totalTTC = priceHT + TVA;

    const templateParams = {
      user_email: email,
      user_name: name,
      date,
      description: "Subscription (20GB)",
      priceHT: priceHT.toFixed(2),
      TVA: TVA.toFixed(2),
      totalTTC: totalTTC.toFixed(2)
    };

    try {
      await emailjs.send(
        'service_uxk9td9', 
        'template_n816hyl', 
        templateParams, 
        'gtjQ3vwclQQbvVLlt'
      );
      alert('Invoice sent successfully via email!');
    } catch (error) {
      console.error('Error sending invoice email:', error);
    }
  };

  const handleSubmitPayment = async () => {
    const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(sanitizedCardNumber)) {
      alert('Invalid card number. Must be 16 digits.');
      return;
    }

    const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; 
    if (!expRegex.test(expDate)) {
      alert('Invalid expiry date format. Use MM/YY.');
      return;
    }

    const [month, year] = expDate.split('/').map(num => parseInt(num, 10));
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      alert('Card has expired.');
      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      alert('Invalid CVC. Must be 3 or 4 digits.');
      return;
    }

    setShowPaymentModal(true);
    await sendVerificationEmail();
  };

  const handlePaymentVerification = () => {
    if (enteredVerificationCode === verificationCode) {
      setPaymentProcessed(true);
      setShowPaymentModal(false);
      alert('Payment verified successfully!');
    } else {
      alert('Incorrect verification code');
    }
  };

  const handleRegister = async () => {
    if (!paymentProcessed) {
      alert('Please complete the payment process first.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/auth/register', { name, email, password });
      await sendInvoiceEmail();
      alert(response.data.message);
      navigate('/login');
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
      
      <h3>Payment Details</h3>
      <h4>20GB FOR 20€</h4>
      <input type="text" placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
      <input type="text" placeholder="Expiry Date (MM/YY)" value={expDate} onChange={e => setExpDate(e.target.value)} required />
      <input type="text" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} required />
      <button onClick={handleSubmitPayment}>Submit Payment</button>
      
      {showPaymentModal && (
        <div className="modal">
          <h3>Enter Payment Verification Code</h3>
          <input type="text" placeholder="Verification Code" value={enteredVerificationCode} onChange={e => setEnteredVerificationCode(e.target.value)} required />
          <button onClick={handlePaymentVerification}>Verify Payment</button>
        </div>
      )}
      
      <button onClick={handleRegister} disabled={!paymentProcessed}>Register</button>
    </div>
  );
};

export default Register;
