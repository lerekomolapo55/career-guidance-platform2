import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ user }) => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Career Guidance and Employment Integration Platform</h1>
          <p className="hero-subtitle">
            Connecting students with higher education opportunities and graduates with career prospects in Lesotho
          </p>
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/auth" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/universities" className="btn btn-secondary btn-large">
                  Explore Universities
                </Link>
              </>
            ) : (
              <div>
                {user.userType === 'institution' ? (
                  <Link to="/institution" className="btn btn-primary btn-large">
                    Go to Institution Dashboard
                  </Link>
                ) : user.userType === 'company' ? (
                  <Link to="/company" className="btn btn-primary btn-large">
                    Go to Company Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    Go to Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>For Students</h3>
              <p>Discover higher learning institutions, apply for courses, and manage your academic journey</p>
              <ul>
                <li>Browse universities and courses</li>
                <li>Apply online with digital transcripts</li>
                <li>Track application status</li>
                <li>Receive admission notifications</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>For Institutions</h3>
              <p>Manage your institution's profile, courses, and student applications efficiently</p>
              <ul>
                <li>Add and manage courses</li>
                <li>Review student applications</li>
                <li>Publish admissions</li>
                <li>Manage student status</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>For Companies</h3>
              <p>Connect with qualified graduates and find the perfect candidates for your organization</p>
              <ul>
                <li>Post job opportunities</li>
                <li>Find qualified candidates</li>
                <li>Manage applications</li>
                <li>Hire talented graduates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Courses Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Partner Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Students Served</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of students and professionals using our platform to achieve their career goals</p>
          <div className="cta-actions">
            {!user ? (
              <Link to="/auth" className="btn btn-primary btn-large">
                Create Your Account
              </Link>
            ) : (
              <div>
                {user.userType === 'institution' ? (
                  <Link to="/institution" className="btn btn-primary btn-large">
                    Go to Institution Dashboard
                  </Link>
                ) : user.userType === 'company' ? (
                  <Link to="/company" className="btn btn-primary btn-large">
                    Go to Company Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    Go to Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;