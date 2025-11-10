import React, { useState } from 'react';
import { authAPI } from './api';
import './AuthPage.css';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    studentType: '',
    institutionName: '',
    companyName: '',
    industry: '',
    location: '',
    type: 'public',
    established: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePortalSelect = (portal) => {
    setSelectedPortal(portal);
    let userType = '';
    let studentType = '';
    
    switch(portal) {
      case 'student':
        userType = 'student';
        studentType = 'highschool';
        break;
      case 'graduate':
        userType = 'student';
        studentType = 'graduate';
        break;
      case 'admin':
        userType = 'admin';
        break;
      case 'university':
        userType = 'institution';
        break;
      case 'company':
        userType = 'company';
        break;
      default:
        userType = '';
        studentType = '';
    }
    
    setFormData({
      ...formData,
      userType,
      studentType
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedPortal) {
      setError('Please select a portal type');
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      let response;
      let data;

      if (isLogin) {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        data = response;
      } else {
        switch(formData.userType) {
          case 'student':
            response = await authAPI.registerStudent({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              studentType: formData.studentType
            });
            data = response;
            break;
          case 'company':
            response = await authAPI.registerCompany({
              companyName: formData.companyName || formData.name,
              email: formData.email,
              password: formData.password,
              industry: formData.industry || 'General',
              location: formData.location || 'Lesotho',
              description: formData.description || ''
            });
            data = response;
            break;
          case 'institution':
            response = await authAPI.registerInstitution({
              institutionName: formData.institutionName || formData.name,
              email: formData.email,
              password: formData.password,
              location: formData.location || 'Lesotho',
              type: formData.type || 'public',
              established: formData.established || '',
              description: formData.description || ''
            });
            data = response;
            break;
          case 'admin':
            response = await authAPI.registerAdmin({
              name: formData.name,
              email: formData.email,
              password: formData.password
            });
            data = response;
            break;
          default:
            throw new Error('Invalid user type');
        }
      }

      if (data.token && data.user) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Registration successful! You can now login.');
        setIsLogin(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: '',
          studentType: '',
          institutionName: '',
          companyName: '',
          industry: '',
          location: '',
          type: 'public',
          established: '',
          description: ''
        });
        setSelectedPortal('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Network error. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const renderPortalButtons = () => (
    <div className="portal-buttons">
      <button
        type="button"
        className={`portal-btn ${selectedPortal === 'student' ? 'active' : ''}`}
        onClick={() => handlePortalSelect('student')}
      >
        Student Portal
      </button>
      <button
        type="button"
        className={`portal-btn ${selectedPortal === 'graduate' ? 'active' : ''}`}
        onClick={() => handlePortalSelect('graduate')}
      >
        Graduate Portal
      </button>
      <button
        type="button"
        className={`portal-btn ${selectedPortal === 'admin' ? 'active' : ''}`}
        onClick={() => handlePortalSelect('admin')}
      >
        Admin Portal
      </button>
      <button
        type="button"
        className={`portal-btn ${selectedPortal === 'university' ? 'active' : ''}`}
        onClick={() => handlePortalSelect('university')}
      >
        University Portal
      </button>
      <button
        type="button"
        className={`portal-btn ${selectedPortal === 'company' ? 'active' : ''}`}
        onClick={() => handlePortalSelect('company')}
      >
        Company Portal
      </button>
    </div>
  );

  const renderFormFields = () => {
    if (isLogin) {
      return (
        <>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>
        </>
      );
    }

    return (
      <>
        {selectedPortal && (
          <div className="portal-info">
            <p>Registering as: <strong>{selectedPortal.toUpperCase()}</strong></p>
          </div>
        )}

        {(selectedPortal === 'student' || selectedPortal === 'graduate' || selectedPortal === 'admin') && (
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
        )}

        {selectedPortal === 'university' && (
          <>
            <div className="form-group">
              <label>Institution Name *</label>
              <input
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                required
                placeholder="Enter institution name"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Maseru, Lesotho"
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
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
                placeholder="e.g., 1945"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description of your institution"
              />
            </div>
          </>
        )}

        {selectedPortal === 'company' && (
          <>
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter company name"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Technology, Education"
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Maseru, Lesotho"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description of your company"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter password (min 6 characters)"
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
            minLength="6"
          />
        </div>
      </>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>{isLogin ? 'Login' : 'Register'}</h1>
          <p>Welcome to CareerGuide Lesotho</p>
        </div>

        {renderPortalButtons()}

        {error && (
          <div className={`error-message ${error.includes('successful') ? 'success' : ''}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {renderFormFields()}

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading || !selectedPortal}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        <div className="auth-info">
          <p><strong>Test Credentials:</strong></p>
          <p>Admin: admin@careerguide.ls / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;