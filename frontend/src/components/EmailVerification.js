import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from './api';
import './EmailVerification.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.message);
        
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    React.createElement('div', { className: 'email-verification' },
      React.createElement('div', { className: 'verification-container' },
        React.createElement('div', { className: 'verification-card' },
          React.createElement('div', { className: 'verification-header' },
            React.createElement('h1', null, 'Email Verification')
          ),
          
          React.createElement('div', { className: 'verification-content' },
            status === 'verifying' && React.createElement('div', { className: 'verifying-state' },
              React.createElement('div', { className: 'loading-spinner' }),
              React.createElement('p', null, 'Verifying your email address...')
            ),

            status === 'success' && React.createElement('div', { className: 'success-state' },
              React.createElement('div', { className: 'success-icon' }, '✓'),
              React.createElement('h2', null, 'Email Verified Successfully!'),
              React.createElement('p', null, message),
              React.createElement('p', null, 'Redirecting to login page...')
            ),

            status === 'error' && React.createElement('div', { className: 'error-state' },
              React.createElement('div', { className: 'error-icon' }, '✗'),
              React.createElement('h2', null, 'Verification Failed'),
              React.createElement('p', null, message),
              React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => navigate('/auth')
              }, 'Go to Login')
            )
          )
        )
      )
    )
  );
};

export default EmailVerification;