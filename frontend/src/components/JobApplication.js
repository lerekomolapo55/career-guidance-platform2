import React, { useState, useEffect } from 'react';
import './JobApplication.css';
import { api } from './api';

const JobApplication = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [qualifiedJobs, setQualifiedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [transcripts, setTranscripts] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchApplications();
      fetchTranscripts();
    }
  }, [user]);

  useEffect(() => {
    if (transcripts.length > 0) {
      fetchQualifiedJobs();
    }
  }, [transcripts]);

  const fetchJobs = async () => {
    try {
      const jobsData = await api.get('/graduate/jobs');
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchQualifiedJobs = async () => {
    try {
      const qualifiedJobsData = await api.get(`/graduate/qualified-jobs/${user.id}`);
      setQualifiedJobs(Array.isArray(qualifiedJobsData) ? qualifiedJobsData : []);
    } catch (error) {
      console.error('Error fetching qualified jobs:', error);
      setQualifiedJobs([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsData = await api.get(`/graduate/applications/${user.id}`);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchTranscripts = async () => {
    try {
      const transcriptsData = await api.get(`/student/transcripts/${user.id}`);
      setTranscripts(Array.isArray(transcriptsData) ? transcriptsData : []);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      setTranscripts([]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploading(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = event.target.result;
          
          await api.post('/student/upload-transcript', {
            studentId: user.id,
            studentType: user.studentType,
            fileName: file.name,
            fileData: fileData
          });

          const updatedTranscripts = await api.get(`/student/transcripts/${user.id}`);
          setTranscripts(Array.isArray(updatedTranscripts) ? updatedTranscripts : []);
          fetchQualifiedJobs();
          alert('Transcript uploaded successfully!');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading transcript:', error);
        alert('Upload failed: ' + error.message);
      } finally {
        setUploading(false);
      }
    } else {
      alert('Please upload only PDF files');
    }
  };

  const handleApply = async () => {
    if (!selectedJob || !coverLetter) {
      alert('Please select a job and provide a cover letter.');
      return;
    }

    try {
      const job = jobs.find(j => j.id === selectedJob);
      await api.post('/graduate/apply-job', {
        studentId: user.id,
        jobId: selectedJob,
        companyId: job.companyId,
        coverLetter: coverLetter
      });

      const updatedApplications = await api.get(`/graduate/applications/${user.id}`);
      setApplications(Array.isArray(updatedApplications) ? updatedApplications : []);
      setCoverLetter('');
      setSelectedJob('');
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to submit application: ' + error.message);
    }
  };

  const handleDeleteTranscript = async (transcriptId) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        await api.delete(`/student/transcripts/${transcriptId}`);
        const updatedTranscripts = transcripts.filter(t => t.id !== transcriptId);
        setTranscripts(updatedTranscripts);
        fetchQualifiedJobs();
        alert('Transcript deleted successfully!');
      } catch (error) {
        console.error('Error deleting transcript:', error);
        alert('Failed to delete transcript');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      verified: 'status-approved'
    }[status] || 'status-pending';

    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeQualifiedJobs = Array.isArray(qualifiedJobs) ? qualifiedJobs : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeTranscripts = Array.isArray(transcripts) ? transcripts : [];

  return (
    <div className="job-application">
      <div className="application-header">
        <h1>Job Applications</h1>
        <p>Apply for jobs at leading companies in Lesotho</p>
      </div>

      <div className="application-tabs">
        <button 
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Jobs
        </button>
        <button 
          className={`tab-button ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          Apply Now
        </button>
        <button 
          className={`tab-button ${activeTab === 'transcripts' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcripts')}
        >
          My Transcripts ({safeTranscripts.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          My Applications ({safeApplications.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'browse' && (
          <div className="browse-jobs">
            <h2>Available Jobs</h2>
            <div className="jobs-grid">
              {safeJobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <span className="company">{job.companyName}</span>
                  </div>
                  <div className="job-details">
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{job.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">{job.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Salary:</span>
                      <span className="value">{job.salary}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Level:</span>
                      <span className="value">{job.level}</span>
                    </div>
                  </div>
                  <div className="job-description">
                    <h4>Description:</h4>
                    <p>{job.description}</p>
                  </div>
                  <div className="job-requirements">
                    <h4>Requirements:</h4>
                    <p>{job.requirements}</p>
                  </div>
                  <div className="job-qualifications">
                    <h4>Qualifications:</h4>
                    <p>{job.qualifications}</p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedJob(job.id);
                      setActiveTab('apply');
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'apply' && (
          <div className="apply-section">
            <h2>Apply for Job</h2>
            <div className="apply-form">
              {safeTranscripts.length === 0 && (
                <div className="warning-message">
                  <p>You need to upload your transcripts before applying for jobs.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('transcripts')}
                  >
                    Upload Transcripts
                  </button>
                </div>
              )}

              {safeTranscripts.length > 0 && safeQualifiedJobs.length === 0 && (
                <div className="warning-message">
                  <p>No qualified jobs found based on your student type. Please browse all jobs.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('browse')}
                  >
                    Browse All Jobs
                  </button>
                </div>
              )}

              {safeTranscripts.length > 0 && safeQualifiedJobs.length > 0 && (
                <>
                  <div className="form-group">
                    <label>Select Job</label>
                    <div className="jobs-selection">
                      {safeQualifiedJobs.map(job => (
                        <div 
                          key={job.id} 
                          className={`job-option ${selectedJob === job.id ? 'selected' : ''}`}
                          onClick={() => setSelectedJob(job.id)}
                        >
                          <div className="job-option-header">
                            <h4>{job.title}</h4>
                            <span className="company">{job.companyName}</span>
                          </div>
                          <div className="job-option-details">
                            <span>Type: {job.type}</span>
                            <span>Location: {job.location}</span>
                            <span>Salary: {job.salary}</span>
                            <span>Level: {job.level}</span>
                          </div>
                          <div className="job-option-description">
                            <strong>Description:</strong> {job.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedJob && (
                    <div className="form-group">
                      <label>Cover Letter</label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Explain why you are interested in this position and why you would be a good candidate..."
                        rows="6"
                        required
                      />
                    </div>
                  )}

                  <div className="form-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={handleApply}
                      disabled={!selectedJob || !coverLetter}
                    >
                      Submit Application
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transcripts' && (
          <div className="transcripts-section">
            <h2>My Transcripts</h2>
            <div className="transcripts-list">
              {safeTranscripts.length > 0 ? (
                safeTranscripts.map(transcript => (
                  <div key={transcript.id} className="transcript-item">
                    <div className="transcript-info">
                      <h4>{transcript.fileName}</h4>
                      <p>Uploaded: {new Date(transcript.uploadedAt).toLocaleDateString()}</p>
                      {getStatusBadge(transcript.status)}
                    </div>
                    <div className="transcript-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          if (transcript.fileData) {
                            const pdfWindow = window.open();
                            pdfWindow.document.write(`
                              <html>
                                <head><title>${transcript.fileName}</title></head>
                                <body style="margin:0;">
                                  <embed src="${transcript.fileData}" type="application/pdf" width="100%" height="100%">
                                </body>
                              </html>
                            `);
                          } else {
                            alert('PDF viewer would open with system default application');
                          }
                        }}
                      >
                        View
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteTranscript(transcript.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No transcripts uploaded yet.</p>
                </div>
              )}
            </div>

            <div className="upload-section">
              <h3>Upload New Transcript</h3>
              <p>Only PDF files are accepted. Maximum file size: 10MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="transcript-upload"
              />
              <button 
                className="btn btn-primary"
                disabled={uploading}
                onClick={() => document.getElementById('transcript-upload').click()}
              >
                {uploading ? 'Uploading...' : 'Upload Transcript'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>My Applications</h2>
            <div className="applications-list">
              {safeApplications.length === 0 ? (
                <div className="no-applications">
                  <p>You haven't applied to any jobs yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('browse')}
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeApplications.map(application => (
                        <tr key={application.id}>
                          <td>{application.jobTitle}</td>
                          <td>{application.companyName}</td>
                          <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                          <td>{getStatusBadge(application.status)}</td>
                          <td>
                            <button className="btn btn-secondary btn-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplication;