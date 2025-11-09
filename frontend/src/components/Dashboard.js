import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (user && user.userType === 'student') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (user.userType === 'student') {
        const [applicationsRes, transcriptsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/student/applications/${user.id}`),
          fetch(`http://localhost:5000/api/student/transcripts/${user.id}`)
        ]);

        const applicationsData = await applicationsRes.json();
        const transcriptsData = await transcriptsRes.json();

        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        setTranscripts(Array.isArray(transcriptsData) ? transcriptsData : []);

        setStats({
          totalApplications: applicationsData.length || 0,
          pendingApplications: applicationsData.filter(app => app.status === 'pending').length || 0,
          approvedApplications: applicationsData.filter(app => app.status === 'approved').length || 0,
          totalTranscripts: transcriptsData.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const renderStudentDashboard = () => (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalApplications || 0}</h3>
          <p>Total Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingApplications || 0}</h3>
          <p>Pending Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats.approvedApplications || 0}</h3>
          <p>Approved Applications</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalTranscripts || 0}</h3>
          <p>Uploaded Transcripts</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/apply-courses" className="action-card">
          <div className="action-icon">
          </div>
          <h3>Apply for Courses</h3>
          <p>Browse and apply to available courses</p>
        </Link>

        <Link to="/universities" className="action-card">
          <div className="action-icon">
          </div>
          <h3>Browse Institutions</h3>
          <p>Explore higher learning institutions</p>
        </Link>

        <Link to="/profile" className="action-card">
          <div className="action-icon">
          </div>
          <h3>My Profile</h3>
          <p>Update your personal information</p>
        </Link>

        {user.studentType === 'graduate' && (
          <Link to="/jobs" className="action-card">
            <div className="action-icon">
            </div>
            <h3>Job Portal</h3>
            <p>Find career opportunities</p>
          </Link>
        )}
      </div>

      <div className="recent-applications">
        <h2>Recent Applications</h2>
        {applications.length > 0 ? (
          <div className="applications-list">
            {applications.slice(0, 5).map(application => (
              <div key={application.id} className="application-item">
                <div className="application-info">
                  <h4>{application.courseName}</h4>
                  <p>{application.institutionName}</p>
                  <span className={`status status-${application.status}`}>
                    {application.status}
                  </span>
                </div>
                <div className="application-date">
                  Applied: {new Date(application.appliedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-applications">
            <p>You haven't applied to any courses yet.</p>
            <Link to="/apply-courses" className="btn btn-primary">Apply Now</Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderDefaultDashboard = () => (
    <div className="default-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Career Guidance Platform</p>
      </div>

      <div className="dashboard-actions">
        <Link to="/universities" className="action-card">
          <div className="action-icon">
          </div>
          <h3>Browse Institutions</h3>
          <p>Explore higher learning institutions in Lesotho</p>
        </Link>

        <Link to="/companies" className="action-card">
          <div className="action-icon">
          </div>
          <h3>Browse Companies</h3>
          <p>Discover career opportunities</p>
        </Link>

        <Link to="/profile" className="action-card">
          <div className="action-icon">
          </div>
          <h3>My Profile</h3>
          <p>Update your account information</p>
        </Link>
      </div>
    </div>
  );

  if (user && (user.userType === 'institution' || user.userType === 'company')) {
    const redirectPath = user.userType === 'institution' ? '/institution' : '/company';
    window.location.href = redirectPath;
    return null;
  }

  return (
    <div className="dashboard-page">
      {user && user.userType === 'student' ? renderStudentDashboard() : renderDefaultDashboard()}
    </div>
  );
};

export default Dashboard;