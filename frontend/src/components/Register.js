import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from './api';
import './Auth.css';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    studentType: 'highschool'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let response;
      let user;

      if (formData.userType === 'student') {
        response = await authAPI.registerStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          studentType: formData.studentType
        });
        user = response.user;
      } else if (formData.userType === 'company') {
        response = await authAPI.registerCompany({
          companyName: formData.name,
          email: formData.email,
          password: formData.password,
          industry: 'Technology',
          location: 'Maseru'
        });
        user = response.user;
      }

      if (response.token) {
        onRegister(user, response.token);
        navigate('/dashboard');
      } else {
        setError('Registration successful! Please check your email for verification.');
      }
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join the Career Guidance Platform</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>User Type</label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="company">Company</option>
          </select>
        </div>

        {formData.userType === 'student' && (
          <div className="form-group">
            <label>Student Type</label>
            <select
              name="studentType"
              value={formData.studentType}
              onChange={handleChange}
              required
            >
              <option value="highschool">High School Student</option>
              <option value="graduate">Graduate</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary full-width"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;