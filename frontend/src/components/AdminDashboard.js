import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { api } from './api';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddInstitution, setShowAddInstitution] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [loading, setLoading] = useState(false);

  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    location: '',
    type: 'public',
    established: '',
    description: '',
    website: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    email: '',
    password: '',
    industry: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsData, institutionsData, companiesData, usersData, approvalsData] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/institutions'),
        api.get('/admin/companies'),
        api.get('/admin/users'),
        api.get('/admin/pending-approvals')
      ]);

      setStats(statsData);
      setInstitutions(Array.isArray(institutionsData) ? institutionsData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPendingApprovals(Array.isArray(approvalsData) ? approvalsData : []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Error loading admin data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/institutions', {
        name: institutionForm.name,
        location: institutionForm.location,
        type: institutionForm.type,
        established: institutionForm.established,
        description: institutionForm.description,
        website: institutionForm.website,
        contact: {
          phone: institutionForm.contactPhone,
          email: institutionForm.contactEmail
        }
      });

      alert('Institution added successfully!');
      setShowAddInstitution(false);
      setInstitutionForm({
        name: '',
        location: '',
        type: 'public',
        established: '',
        description: '',
        website: '',
        contactPhone: '',
        contactEmail: ''
      });
      fetchAdminData();
    } catch (error) {
      alert('Error adding institution: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/companies', companyForm);
      
      alert('Company added successfully!');
      setShowAddCompany(false);
      setCompanyForm({
        companyName: '',
        email: '',
        password: '',
        industry: '',
        location: '',
        description: ''
      });
      fetchAdminData();
    } catch (error) {
      alert('Error adding company: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      await api.put(`/admin/companies/${id}/approve`);
      alert(`${type} approved successfully!`);
      fetchAdminData();
    } catch (error) {
      alert(`Error approving ${type}: ` + error.message);
    }
  };

  const handleSuspend = async (id, type) => {
    try {
      await api.put(`/admin/companies/${id}/suspend`);
      alert(`${type} suspended successfully!`);
      fetchAdminData();
    } catch (error) {
      alert(`Error suspending ${type}: ` + error.message);
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await api.delete(`/admin/institutions/${id}`);
        alert('Institution deleted successfully!');
        fetchAdminData();
      } catch (error) {
        alert('Error deleting institution: ' + error.message);
      }
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await api.delete(`/admin/companies/${id}`);
        alert('Company deleted successfully!');
        fetchAdminData();
      } catch (error) {
        alert('Error deleting company: ' + error.message);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Note: You'll need to add a DELETE user endpoint in your backend
        alert('User deletion functionality would be implemented here');
        // For now, just remove from local state
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully!');
      } catch (error) {
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      active: 'status-approved',
      pending: 'status-pending',
      approved: 'status-approved',
      suspended: 'status-rejected',
      verified: 'status-approved'
    }[status] || '';

    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>System administration and management</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System administration and management</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'institutions' ? 'active' : ''}`}
          onClick={() => setActiveTab('institutions')}
        >
          Institutions ({institutions.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          Companies ({companies.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          Pending Approvals ({pendingApprovals.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Institutions</h3>
                <div className="stat-number">{stats.totalInstitutions || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Approved Companies</h3>
                <div className="stat-number">{stats.totalCompanies || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{stats.totalUsers || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Approvals</h3>
                <div className="stat-number">{stats.pendingApprovals || 0}</div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddInstitution(true)}
                >
                  Add New Institution
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddCompany(true)}
                >
                  Add New Company
                </button>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-university"></i>
                  </div>
                  <div className="activity-details">
                    <p><strong>Total Institutions:</strong> {institutions.length}</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="activity-details">
                    <p><strong>Total Companies:</strong> {companies.length}</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="activity-details">
                    <p><strong>Total Users:</strong> {users.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs remain the same as in the previous implementation */}
        {activeTab === 'institutions' && (
          <div className="institutions-content">
            <div className="section-header">
              <h2>Manage Institutions</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddInstitution(true)}
              >
                Add New Institution
              </button>
            </div>

            {showAddInstitution && (
              <div className="form-modal">
                <div className="modal-content">
                  <h3>Add New Institution</h3>
                  <form onSubmit={handleAddInstitution}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Institution Name *</label>
                        <input
                          type="text"
                          value={institutionForm.name}
                          onChange={(e) => setInstitutionForm({...institutionForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          value={institutionForm.location}
                          onChange={(e) => setInstitutionForm({...institutionForm, location: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Type *</label>
                        <select
                          value={institutionForm.type}
                          onChange={(e) => setInstitutionForm({...institutionForm, type: e.target.value})}
                          required
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Year Established</label>
                        <input
                          type="number"
                          value={institutionForm.established}
                          onChange={(e) => setInstitutionForm({...institutionForm, established: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={institutionForm.description}
                        onChange={(e) => setInstitutionForm({...institutionForm, description: e.target.value})}
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Website</label>
                        <input
                          type="url"
                          value={institutionForm.website}
                          onChange={(e) => setInstitutionForm({...institutionForm, website: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Phone</label>
                        <input
                          type="tel"
                          value={institutionForm.contactPhone}
                          onChange={(e) => setInstitutionForm({...institutionForm, contactPhone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        value={institutionForm.contactEmail}
                        onChange={(e) => setInstitutionForm({...institutionForm, contactEmail: e.target.value})}
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowAddInstitution(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Adding...' : 'Add Institution'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Established</th>
                    <th>Contact Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.length > 0 ? (
                    institutions.map(institution => (
                      <tr key={institution.id}>
                        <td>{institution.name}</td>
                        <td>{institution.location}</td>
                        <td>{institution.type}</td>
                        <td>{institution.established || 'N/A'}</td>
                        <td>{institution.contact?.email || 'N/A'}</td>
                        <td>{getStatusBadge(institution.isActive ? 'active' : 'inactive')}</td>
                        <td>
                          <button className="btn btn-secondary btn-sm">Edit</button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteInstitution(institution.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No institutions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="companies-content">
            <div className="section-header">
              <h2>Manage Companies</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddCompany(true)}
              >
                Add New Company
              </button>
            </div>

            {showAddCompany && (
              <div className="form-modal">
                <div className="modal-content">
                  <h3>Add New Company</h3>
                  <form onSubmit={handleAddCompany}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input
                          type="text"
                          value={companyForm.companyName}
                          onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          value={companyForm.password}
                          onChange={(e) => setCompanyForm({...companyForm, password: e.target.value})}
                          required
                          minLength="6"
                        />
                      </div>
                      <div className="form-group">
                        <label>Industry *</label>
                        <input
                          type="text"
                          value={companyForm.industry}
                          onChange={(e) => setCompanyForm({...companyForm, industry: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          value={companyForm.location}
                          onChange={(e) => setCompanyForm({...companyForm, location: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowAddCompany(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Adding...' : 'Add Company'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? (
                    companies.map(company => (
                      <tr key={company.id}>
                        <td>{company.companyName}</td>
                        <td>{company.industry}</td>
                        <td>{company.location}</td>
                        <td>{company.email}</td>
                        <td>
                          {getStatusBadge(company.isApproved ? 'approved' : 'pending')}
                        </td>
                        <td>
                          {!company.isApproved && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApprove(company.id, 'Company')}
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleSuspend(company.id, 'Company')}
                          >
                            {company.isApproved ? 'Suspend' : 'Reject'}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCompany(company.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No companies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-content">
            <div className="section-header">
              <h2>Manage Users</h2>
              <p>Total Users: {users.length}</p>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>User Type</th>
                    <th>Student Type</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name || user.companyName || user.institutionName || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`user-type ${user.userType}`}>
                            {user.userType}
                          </span>
                        </td>
                        <td>{user.studentType || 'N/A'}</td>
                        <td>
                          {getStatusBadge(
                            user.isApproved === false ? 'pending' : 
                            user.isVerified ? 'verified' : 'active'
                          )}
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-secondary btn-sm">View</button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="users-stats">
              <h3>User Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Students</h4>
                  <div className="stat-number">
                    {users.filter(u => u.userType === 'student').length}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Institutions</h4>
                  <div className="stat-number">
                    {users.filter(u => u.userType === 'institution').length}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Companies</h4>
                  <div className="stat-number">
                    {users.filter(u => u.userType === 'company').length}
                  </div>
                </div>
                <div className="stat-card">
                  <h4>Admins</h4>
                  <div className="stat-number">
                    {users.filter(u => u.userType === 'admin').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="approvals-content">
            <div className="section-header">
              <h2>Pending Approvals</h2>
              <p>Applications waiting for approval</p>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Industry/Type</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.map(approval => (
                      <tr key={approval.id}>
                        <td>{approval.companyName || approval.institutionName || approval.name}</td>
                        <td>
                          <span className={`user-type ${approval.userType || (approval.companyName ? 'company' : 'institution')}`}>
                            {approval.userType || (approval.companyName ? 'company' : 'institution')}
                          </span>
                        </td>
                        <td>{approval.email}</td>
                        <td>{approval.location || 'N/A'}</td>
                        <td>{approval.industry || approval.type || 'N/A'}</td>
                        <td>{new Date(approval.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApprove(approval.id, approval.userType || (approval.companyName ? 'Company' : 'Institution'))}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleSuspend(approval.id, approval.userType || (approval.companyName ? 'Company' : 'Institution'))}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No pending approvals
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;