import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const location = useLocation();

  const handleDashboardClick = () => {
    if (user && user.userType === 'company') {
      window.location.href = '/company';
    } else if (user && user.userType === 'institution') {
      window.location.href = '/institution';
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span>CareerGuide</span>
        </div>
        
        <nav>
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            
            {user && user.userType === 'student' && user.studentType === 'highschool' && (
              <>
                <li>
                  <Link 
                    to="/universities" 
                    className={location.pathname === '/universities' ? 'active' : ''}
                  >
                    Universities
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/undergraduate" 
                    className={location.pathname === '/undergraduate' ? 'active' : ''}
                  >
                    Undergraduate Portal
                  </Link>
                </li>
              </>
            )}
            
            {user && user.userType === 'student' && user.studentType === 'graduate' && (
              <>
                <li>
                  <Link 
                    to="/universities" 
                    className={location.pathname === '/universities' ? 'active' : ''}
                  >
                    Universities
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/companies" 
                    className={location.pathname === '/companies' ? 'active' : ''}
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/graduate" 
                    className={location.pathname === '/graduate' ? 'active' : ''}
                  >
                    Graduate Portal
                  </Link>
                </li>
              </>
            )}
            
            {(!user || user.userType === 'admin') && (
              <>
                <li>
                  <Link 
                    to="/universities" 
                    className={location.pathname === '/universities' ? 'active' : ''}
                  >
                    Universities
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/companies" 
                    className={location.pathname === '/companies' ? 'active' : ''}
                  >
                    Companies
                  </Link>
                </li>
              </>
            )}
            
            {user && user.userType === 'admin' && (
              <li>
                <Link 
                  to="/admin" 
                  className={location.pathname === '/admin' ? 'active' : ''}
                >
                  Admin Dashboard
                </Link>
              </li>
            )}
            
            {user && user.userType === 'institution' && (
              <li>
                <Link 
                  to="/institution" 
                  className={location.pathname === '/institution' ? 'active' : ''}
                >
                  Institution Dashboard
                </Link>
              </li>
            )}
            
            {user && user.userType === 'company' && (
              <li>
                <Link 
                  to="/company" 
                  className={location.pathname === '/company' ? 'active' : ''}
                >
                  Company Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="user-section">
          {user ? (
            <>
              <div className="user-info">
                <span>{user.name || user.institutionName || user.companyName}</span>
                <span className="user-role">({user.userType})</span>
              </div>
              <button onClick={handleDashboardClick} className="btn btn-secondary">
                Dashboard
              </button>
              <Link to="/profile" className="btn btn-secondary">
                Profile
              </Link>
              <button onClick={onLogout} className="btn btn-danger">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;