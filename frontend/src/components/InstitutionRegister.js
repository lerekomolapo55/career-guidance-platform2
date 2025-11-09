import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './InstitutionAuth.css';

const InstitutionRegister = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    institutionName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    type: 'public',
    established: '',
    description: ''
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
      const response = await axios.post('/auth/register/institution', {
        institutionName: formData.institutionName,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        type: formData.type
      });
      
      if (response.data.token) {
        onRegister(response.data.institution, response.data.token);
        navigate('/institution');
      } else {
        setError('Registration successful! Waiting for admin approval.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Institution Registration</h1>
        <p>Register your higher learning institution</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Institution Name</label>
          <input
            type="text"
            name="institutionName"
            value={formData.institutionName}
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

        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Institution Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Year Established</label>
          <input
            type="number"
            name="established"
            value={formData.established}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Institution Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

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
          {loading ? 'Registering...' : 'Register Institution'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <Link to="/institution/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default InstitutionRegister;