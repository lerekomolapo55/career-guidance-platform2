import React, { useState, useEffect } from 'react';
import { companyAPI, authAPI } from './api';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    industry: '',
    description: '',
    contactEmail: '',
    phone: '',
    address: '',
    website: ''
  });
  const [jobPostings, setJobPostings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    qualifications: '',
    location: '',
    deadline: '',
    salary: '',
    minGPA: '',
    requiredCertificates: '',
    requiredExperience: '',
    jobType: 'Full-time'
  });
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');

  // Get current company user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id && user.userType === 'company') {
      setCompanyId(user.id);
      loadCompanyData(user.id);
    }
  }, []);

  // Load company data from server
  const loadCompanyData = async (id) => {
    try {
      setLoading(true);
      
      // Load company profile
      const profileResponse = await companyAPI.getCompanyProfile(id);
      if (profileResponse) {
        setCompanyProfile(profileResponse);
      } else {
        // Set default profile from user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCompanyProfile({
          name: user.companyName || '',
          industry: user.industry || '',
          description: user.description || '',
          contactEmail: user.email || '',
          phone: '',
          address: user.location || '',
          website: ''
        });
      }

      // Load company jobs
      const jobsResponse = await companyAPI.getCompanyJobs(id);
      if (jobsResponse) {
        setJobPostings(Array.isArray(jobsResponse) ? jobsResponse : []);
      }

      // Load applicants (you'll need to implement this endpoint)
      // const applicantsResponse = await companyAPI.getCompanyApplications(id);
      // if (applicantsResponse) {
      //   setApplicants(Array.isArray(applicantsResponse) ? applicantsResponse : []);
      //   filterQualifiedApplicants(applicantsResponse);
      // }

    } catch (error) {
      console.error('Error loading company data:', error);
      alert('Error loading company data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter qualified applicants based on criteria
  const filterQualifiedApplicants = (applicantsList) => {
    const qualified = applicantsList.filter(applicant => {
      const meetsAcademic = applicant.gpa >= 2.5;
      const hasCertificates = applicant.certificates && applicant.certificates.length > 0;
      const hasExperience = applicant.experience >= 1;
      const isRelevant = applicant.relevanceScore >= 70;

      return meetsAcademic && hasCertificates && hasExperience && isRelevant;
    });
    setFilteredApplicants(qualified);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // You'll need to implement updateCompanyProfile endpoint
      // await companyAPI.updateCompanyProfile(companyId, companyProfile);
      localStorage.setItem('companyProfile', JSON.stringify(companyProfile));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobPost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const jobData = {
        ...newJob,
        companyId: companyId,
        companyName: companyProfile.name,
        status: 'active'
      };

      const response = await companyAPI.postJob(jobData);
      
      if (response && response.jobId) {
        const updatedJobs = [...jobPostings, { ...jobData, id: response.jobId }];
        setJobPostings(updatedJobs);
        
        // Reset form
        setNewJob({
          title: '',
          description: '',
          requirements: '',
          qualifications: '',
          location: '',
          deadline: '',
          salary: '',
          minGPA: '',
          requiredCertificates: '',
          requiredExperience: '',
          jobType: 'Full-time'
        });
        
        alert('Job posted successfully!');
        setActiveTab('dashboard');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const viewApplicantDetails = (applicant) => {
    alert(`Applicant Details:\n\nName: ${applicant.name}\nEmail: ${applicant.email}\nGPA: ${applicant.gpa}\nExperience: ${applicant.experience} years\nEducation: ${applicant.education}\nCertificates: ${applicant.certificates ? applicant.certificates.join(', ') : 'None'}\nSkills: ${applicant.skills ? applicant.skills.join(', ') : 'None'}\nRelevance Score: ${applicant.relevanceScore || 'N/A'}%`);
  };

  const contactApplicant = (applicant) => {
    const subject = `Interview Opportunity - ${companyProfile.name}`;
    const body = `Dear ${applicant.name},\n\nWe were impressed by your profile and would like to invite you for an interview.\n\nBest regards,\n${companyProfile.name}`;
    window.open(`mailto:${applicant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        setLoading(true);
        await companyAPI.deleteJob(jobId);
        const updatedJobs = jobPostings.filter(job => job.id !== jobId);
        setJobPostings(updatedJobs);
        alert('Job posting deleted successfully!');
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Error deleting job. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateJobStatus = async (jobId, status) => {
    try {
      setLoading(true);
      await companyAPI.updateJob(jobId, { status });
      const updatedJobs = jobPostings.map(job => 
        job.id === jobId ? { ...job, status } : job
      );
      setJobPostings(updatedJobs);
      alert(`Job ${status} successfully!`);
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="company-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
        <p>Welcome, {companyProfile.name}</p>
      </div>

      <div className="dashboard-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'post-job' ? 'active' : ''}
          onClick={() => setActiveTab('post-job')}
        >
          Post Job
        </button>
        <button 
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
        >
          Manage Jobs ({jobPostings.length})
        </button>
        <button 
          className={activeTab === 'applicants' ? 'active' : ''}
          onClick={() => setActiveTab('applicants')}
        >
          Qualified Applicants ({filteredApplicants.length})
        </button>
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Company Profile
        </button>
      </div>

      <div className="dashboard-content">
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="overview">
            <h2>Company Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Active Jobs</h3>
                <p>{jobPostings.filter(job => job.status === 'active').length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Applicants</h3>
                <p>{applicants.length}</p>
              </div>
              <div className="stat-card">
                <h3>Qualified Candidates</h3>
                <p>{filteredApplicants.length}</p>
              </div>
              
            </div>

            <div className="recent-section">
              <div className="recent-jobs">
                <h3>Recent Job Postings</h3>
                {jobPostings.length === 0 ? (
                  <p className="no-data">No job postings yet. Post your first job!</p>
                ) : (
                  jobPostings.slice(0, 3).map(job => (
                    <div key={job.id} className="job-item">
                      <div className="job-header">
                        <h4>{job.title}</h4>
                        <span className={`status ${job.status}`}>{job.status}</span>
                      </div>
                      <p>Location: {job.location} | Type: {job.jobType}</p>
                      <p>Applicants: {job.applicants || 0} | Posted: {job.postedDate || new Date().toISOString().split('T')[0]}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="recent-applicants">
                <h3>Top Qualified Applicants</h3>
                {filteredApplicants.length === 0 ? (
                  <p className="no-data">No qualified applicants yet.</p>
                ) : (
                  filteredApplicants.slice(0, 3).map(applicant => (
                    <div key={applicant.id} className="applicant-item">
                      <div className="applicant-header">
                        <h4>{applicant.name}</h4>
                        <span className="score">{applicant.relevanceScore || 'N/A'}% match</span>
                      </div>
                      <p>{applicant.education}</p>
                      <p>GPA: {applicant.gpa} | Experience: {applicant.experience} years</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Job Form */}
        {activeTab === 'post-job' && (
          <div className="post-job">
            <h2>Post New Job Opportunity</h2>
            <form onSubmit={handleJobPost}>
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newJob.title}
                  onChange={handleJobInputChange}
                  placeholder="e.g., Software Developer"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Job Type *</label>
                  <select
                    name="jobType"
                    value={newJob.jobType}
                    onChange={handleJobInputChange}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={newJob.location}
                    onChange={handleJobInputChange}
                    placeholder="e.g., Maseru, Lesotho"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  value={newJob.description}
                  onChange={handleJobInputChange}
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Requirements *</label>
                <textarea
                  name="requirements"
                  value={newJob.requirements}
                  onChange={handleJobInputChange}
                  placeholder="List required skills, technologies, competencies..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Qualifications *</label>
                <input
                  type="text"
                  name="qualifications"
                  value={newJob.qualifications}
                  onChange={handleJobInputChange}
                  placeholder="e.g., Bachelor's Degree in Computer Science"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum GPA</label>
                  <input
                    type="number"
                    name="minGPA"
                    value={newJob.minGPA}
                    onChange={handleJobInputChange}
                    min="0"
                    max="4"
                    step="0.1"
                    placeholder="2.5"
                  />
                </div>

                <div className="form-group">
                  <label>Required Experience (years)</label>
                  <input
                    type="number"
                    name="requiredExperience"
                    value={newJob.requiredExperience}
                    onChange={handleJobInputChange}
                    min="0"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Required Certificates</label>
                  <input
                    type="text"
                    name="requiredCertificates"
                    value={newJob.requiredCertificates}
                    onChange={handleJobInputChange}
                    placeholder="e.g., AWS Certified, Microsoft Certified"
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={newJob.deadline}
                    onChange={handleJobInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  value={newJob.salary}
                  onChange={handleJobInputChange}
                  placeholder="e.g., M15,000 - M20,000"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Job'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setActiveTab('dashboard')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Jobs */}
        {activeTab === 'jobs' && (
          <div className="jobs-management">
            <h2>Manage Job Postings</h2>
            <div className="jobs-list">
              {jobPostings.length === 0 ? (
                <div className="no-jobs">
                  <p>No job postings yet.</p>
                  <button className="post-first-job" onClick={() => setActiveTab('post-job')}>
                    Post Your First Job
                  </button>
                </div>
              ) : (
                jobPostings.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-header">
                      <h3>{job.title}</h3>
                      <span className={`status-badge ${job.status}`}>{job.status}</span>
                    </div>
                    <div className="job-details">
                      <p><strong>Type:</strong> {job.jobType}</p>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
                      <p><strong>Posted:</strong> {job.postedDate || new Date().toISOString().split('T')[0]}</p>
                      <p><strong>Deadline:</strong> {job.deadline}</p>
                      <p><strong>Applicants:</strong> {job.applicants || 0}</p>
                    </div>
                    <div className="job-actions">
                      <button className="view-btn">View Details</button>
                      <button 
                        className="status-btn"
                        onClick={() => updateJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')}
                        disabled={loading}
                      >
                        {job.status === 'active' ? 'Close Job' : 'Activate Job'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteJob(job.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* View Applicants */}
        {activeTab === 'applicants' && (
          <div className="applicants">
            <h2>Qualified Applicants Ready for Interview</h2>
            <p className="applicants-subtitle">
              These candidates meet all your job requirements and are ready for interview consideration.
            </p>
            <div className="applicants-list">
              {filteredApplicants.length === 0 ? (
                <div className="no-applicants">
                  <p>No qualified applicants found matching your current job requirements.</p>
                  <p>Applicants are automatically filtered based on:</p>
                  <ul>
                    <li>Academic performance (GPA 2.5+)</li>
                    <li>Relevant certificates</li>
                    <li>Work experience (1+ years)</li>
                    <li>Relevance to your job posts</li>
                  </ul>
                </div>
              ) : (
                filteredApplicants.map(applicant => (
                  <div key={applicant.id} className="applicant-card">
                    <div className="applicant-header">
                      <h3>{applicant.name}</h3>
                      <div className="applicant-score">
                        <span className="score">{applicant.relevanceScore || 'N/A'}% Match</span>
                      </div>
                    </div>
                    <div className="applicant-info">
                      <p><strong>Email:</strong> {applicant.email}</p>
                      <p><strong>Education:</strong> {applicant.education}</p>
                      <p><strong>GPA:</strong> {applicant.gpa}/4.0</p>
                      <p><strong>Experience:</strong> {applicant.experience} years</p>
                      <p><strong>Certificates:</strong> {applicant.certificates ? applicant.certificates.join(', ') : 'None'}</p>
                      <p><strong>Skills:</strong> {applicant.skills ? applicant.skills.join(', ') : 'None'}</p>
                    </div>
                    <div className="applicant-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => viewApplicantDetails(applicant)}
                      >
                        View Full Details
                      </button>
                      <button 
                        className="contact-btn"
                        onClick={() => contactApplicant(applicant)}
                      >
                        Contact for Interview
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Company Profile */}
        {activeTab === 'profile' && (
          <div className="profile">
            <h2>Company Profile</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="name"
                  value={companyProfile.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={companyProfile.industry}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="description"
                  value={companyProfile.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your company, mission, and values..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={companyProfile.contactEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={companyProfile.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={companyProfile.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={companyProfile.website}
                  onChange={handleInputChange}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setActiveTab('dashboard')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;