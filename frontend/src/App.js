import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import InstitutionDashboard from './components/InstitutionDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import Universities from './components/Universities';
import Companies from './components/Companies';
import UndergraduatePortal from './components/UndergraduatePortal';
import GraduateJobPortal from './components/GraduateJobPortal';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading Career Guidance Platform...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route 
              path="/auth" 
              element={
                !user ? <AuthPage onLogin={login} /> : <Navigate to="/" />
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.userType === 'institution' ? (
                    <Navigate to="/institution" />
                  ) : user.userType === 'company' ? (
                    <Navigate to="/company" />
                  ) : (
                    <ProtectedRoute user={user}>
                      <Dashboard user={user} />
                    </ProtectedRoute>
                  )
                ) : (
                  <Navigate to="/auth" />
                )
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <AdminDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/institution" 
              element={
                <ProtectedRoute user={user} requiredRole="institution">
                  <InstitutionDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company" 
              element={
                <ProtectedRoute user={user} requiredRole="company">
                  <CompanyDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/universities" element={<Universities user={user} />} />
            <Route path="/companies" element={<Companies user={user} />} />
            
            <Route 
              path="/undergraduate" 
              element={
                <ProtectedRoute user={user} requiredRole="student">
                  <UndergraduatePortal user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/graduate" 
              element={
                <ProtectedRoute user={user} requiredRole="student">
                  <GraduateJobPortal user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute user={user}>
                  <Profile user={user} />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;