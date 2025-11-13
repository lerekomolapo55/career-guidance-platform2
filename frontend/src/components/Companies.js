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
      React.createElement('div', { className: 'companies-page' },
        React.createElement('div', { className: 'loading' }, 'Loading companies...')
      )
    );
  }

  return (
    React.createElement('div', { className: 'companies-page' },
      React.createElement('div', { className: 'companies-hero' },
        React.createElement('h1', null, 'Partner Companies'),
        React.createElement('p', null, 'Connect with leading employers in Lesotho and discover career opportunities')
      ),

      React.createElement('div', { className: 'companies-content' },
        React.createElement('div', { className: 'companies-filters' },
          React.createElement('div', { className: 'search-box' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'Search companies...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value)
            })
          ),
          React.createElement('div', { className: 'filter-box' },
            React.createElement('select', {
              value: filterIndustry,
              onChange: (e) => setFilterIndustry(e.target.value)
            },
              React.createElement('option', { value: '' }, 'All Industries'),
              industries.map(industry => 
                React.createElement('option', { key: industry, value: industry }, industry)
              )
            )
          )
        ),

        React.createElement('div', { className: 'companies-stats' },
          React.createElement('div', { className: 'stat-item' },
            React.createElement('h3', null, featuredCompanies.length),
            React.createElement('p', null, 'Partner Companies')
          ),
          React.createElement('div', { className: 'stat-item' },
            React.createElement('h3', null, industries.length),
            React.createElement('p', null, 'Industries')
          )
        ),

        React.createElement('div', { className: 'companies-grid' },
          filteredCompanies.length === 0 ? 
            React.createElement('div', { className: 'no-companies' },
              React.createElement('p', null, 'No companies found matching your criteria.'),
              featuredCompanies.length === 0 && 
                React.createElement('button', { 
                  className: 'register-company-btn', 
                  onClick: handleRegisterCompany 
                }, 'Register Your Company')
            ) :
            filteredCompanies.map(company => 
              React.createElement('div', { key: company.id, className: 'company-card' },
                React.createElement('div', { className: 'company-logo' },
                  company.companyName ? company.companyName.charAt(0).toUpperCase() : 'C'
                ),
                React.createElement('div', { className: 'company-info' },
                  React.createElement('h3', null, company.companyName || 'Company Name'),
                  React.createElement('p', { className: 'company-industry' }, company.industry || 'Industry not specified'),
                  React.createElement('p', { className: 'company-description' },
                    company.description || 'No description available.'
                  ),
                  React.createElement('div', { className: 'company-details' },
                    React.createElement('span', { className: 'location' }, 'Location: ' + (company.location || 'Not specified')),
                    React.createElement('span', { className: 'jobs' }, 'Open Positions: ' + (company.jobs || 'Coming soon'))
                  )
                ),
                React.createElement('button', {
                  className: 'view-jobs-btn',
                  onClick: () => handleViewOpportunities(company.companyName)
                }, 'View Opportunities')
              )
            )
        ),

        React.createElement('div', { className: 'companies-cta' },
          React.createElement('h2', null, 'Want to list your company?'),
          React.createElement('p', null, 'Join our network of partner companies and connect with qualified candidates'),
          React.createElement('button', { 
            className: 'cta-button', 
            onClick: handleRegisterCompany 
          }, 'Register Your Company')
        )
      )
    )
  );
};

export default Companies;