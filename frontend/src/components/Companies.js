import React, { useState, useEffect } from 'react';
import { generalAPI } from './api';
import './Companies.css';

const Companies = () => {
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companies = await generalAPI.getCompanies();
      setFeaturedCompanies(Array.isArray(companies) ? companies : []);
    } catch (error) {
      console.error('Error loading companies:', error);
      setFeaturedCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOpportunities = (companyName) => {
    alert(`Viewing opportunities at ${companyName}`);
  };

  const handleRegisterCompany = () => {
    window.location.href = '/auth?tab=company';
  };

  const filteredCompanies = featuredCompanies.filter(company => {
    const matchesSearch = company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !filterIndustry || company.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  const industries = [...new Set(featuredCompanies.map(company => company.industry).filter(Boolean))];

  if (loading) {
    return (
      <div className="companies-page">
        <div className="loading">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="companies-page">
      <div className="companies-hero">
        <h1>Partner Companies</h1>
        <p>Connect with leading employers in Lesotho and discover career opportunities</p>
      </div>

      <div className="companies-content">
        <div className="companies-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="companies-stats">
          <div className="stat-item">
            <h3>{featuredCompanies.length}</h3>
            <p>Partner Companies</p>
          </div>
          <div className="stat-item">
            <h3>{industries.length}</h3>
            <p>Industries</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Job Opportunities</p>
          </div>
        </div>

        <div className="companies-grid">
          {filteredCompanies.length === 0 ? (
            <div className="no-companies">
              <p>No companies found matching your criteria.</p>
              {featuredCompanies.length === 0 && (
                <button className="register-company-btn" onClick={handleRegisterCompany}>
                  Register Your Company
                </button>
              )}
            </div>
          ) : (
            filteredCompanies.map(company => (
              <div key={company.id} className="company-card">
                <div className="company-logo">
                  {company.companyName ? company.companyName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="company-info">
                  <h3>{company.companyName || 'Company Name'}</h3>
                  <p className="company-industry">{company.industry || 'Industry not specified'}</p>
                  <p className="company-description">
                    {company.description || 'No description available.'}
                  </p>
                  <div className="company-details">
                    <span className="location">Location: {company.location || 'Not specified'}</span>
                    <span className="jobs">Open Positions: {company.jobs || 'Coming soon'}</span>
                  </div>
                </div>
                <button 
                  className="view-jobs-btn"
                  onClick={() => handleViewOpportunities(company.companyName)}
                >
                  View Opportunities
                </button>
              </div>
            ))
          )}
        </div>

        <div className="companies-cta">
          <h2>Want to list your company?</h2>
          <p>Join our network of partner companies and connect with qualified candidates</p>
          <button className="cta-button" onClick={handleRegisterCompany}>
            Register Your Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default Companies;