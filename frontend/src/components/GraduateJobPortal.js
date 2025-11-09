import React, { useState, useEffect } from 'react';
import { graduateAPI, studentAPI } from './api';
import './GraduateJobPortal.css';

const GraduateJobPortal = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [qualifiedJobs, setQualifiedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      const jobsData = await graduateAPI.getJobs();
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchQualifiedJobs = async () => {
    try {
      const qualifiedJobsData = await graduateAPI.getQualifiedJobs(user.id);
      setQualifiedJobs(Array.isArray(qualifiedJobsData) ? qualifiedJobsData : []);
    } catch (error) {
      console.error('Error fetching qualified jobs:', error);
      setQualifiedJobs([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsData = await graduateAPI.getApplications(user.id);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchTranscripts = async () => {
    try {
      const transcriptsData = await studentAPI.getTranscripts(user.id);
      setTranscripts(Array.isArray(transcriptsData) ? transcriptsData : []);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      setTranscripts([]);
    }
  };

  const handleApplyJob = async () => {
    if (!selectedJob || !coverLetter) {
      setMessage('Please select a job and provide a cover letter');
      return;
    }

    try {
      await graduateAPI.applyJob({
        studentId: user.id,
        jobId: selectedJob.id,
        companyId: selectedJob.companyId,
        coverLetter: coverLetter
      });

      await fetchApplications();
      setCoverLetter('');
      setSelectedJob(null);
      setMessage('Job application submitted successfully');
    } catch (error) {
      setMessage('Failed to submit application: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    }[status] || 'status-pending';

    return React.createElement('span', { className: `status-badge ${statusClass}` }, status);
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeQualifiedJobs = Array.isArray(qualifiedJobs) ? qualifiedJobs : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeTranscripts = Array.isArray(transcripts) ? transcripts : [];

  return React.createElement('div', { className: 'graduate-job-portal' },
    React.createElement('div', { className: 'portal-header' },
      React.createElement('h1', null, 'Graduate Job Portal'),
      React.createElement('p', null, 'Find and apply for job opportunities in Lesotho')
    ),

    message && React.createElement('div', { 
      className: `message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}` 
    }, message),

    React.createElement('div', { className: 'portal-tabs' },
      React.createElement('button', {
        className: `tab-button ${activeTab === 'browse' ? 'active' : ''}`,
        onClick: () => setActiveTab('browse')
      }, 'Browse All Jobs'),
      React.createElement('button', {
        className: `tab-button ${activeTab === 'qualified' ? 'active' : ''}`,
        onClick: () => setActiveTab('qualified')
      }, `Qualified Jobs (${safeQualifiedJobs.length})`),
      React.createElement('button', {
        className: `tab-button ${activeTab === 'apply' ? 'active' : ''}`,
        onClick: () => setActiveTab('apply')
      }, 'Apply Now'),
      React.createElement('button', {
        className: `tab-button ${activeTab === 'applications' ? 'active' : ''}`,
        onClick: () => setActiveTab('applications')
      }, `My Applications (${safeApplications.length})`)
    ),

    React.createElement('div', { className: 'tab-content' },
      activeTab === 'browse' && React.createElement('div', { className: 'browse-jobs' },
        React.createElement('h2', null, 'All Available Jobs'),
        React.createElement('div', { className: 'jobs-grid' },
          safeJobs.length === 0 ? 
            React.createElement('div', { className: 'no-jobs' },
              React.createElement('p', null, 'No jobs available at the moment')
            ) :
            safeJobs.map(job => 
              React.createElement('div', { key: job.id, className: 'job-card' },
                React.createElement('div', { className: 'job-header' },
                  React.createElement('h3', null, job.title),
                  React.createElement('span', { className: 'company' }, job.companyName)
                ),
                React.createElement('div', { className: 'job-details' },
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Type:'),
                    React.createElement('span', { className: 'value' }, job.type)
                  ),
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Salary:'),
                    React.createElement('span', { className: 'value' }, job.salary)
                  ),
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Location:'),
                    React.createElement('span', { className: 'value' }, job.location)
                  ),
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Level:'),
                    React.createElement('span', { className: 'value' }, job.level)
                  )
                ),
                React.createElement('div', { className: 'job-description' },
                  React.createElement('h4', null, 'Job Description'),
                  React.createElement('p', null, job.description)
                ),
                React.createElement('div', { className: 'job-requirements' },
                  React.createElement('h4', null, 'Requirements'),
                  React.createElement('p', null, job.requirements)
                ),
                React.createElement('button', {
                  className: 'btn btn-primary',
                  onClick: () => {
                    setSelectedJob(job);
                    setActiveTab('apply');
                  }
                }, 'Apply Now')
              )
            )
        )
      ),

      activeTab === 'qualified' && React.createElement('div', { className: 'qualified-jobs' },
        React.createElement('h2', null, 'Jobs You Qualify For'),
        safeTranscripts.length === 0 ? 
          React.createElement('div', { className: 'no-transcripts' },
            React.createElement('h3', null, 'Transcripts Required'),
            React.createElement('p', null, 'Upload your academic transcripts to see jobs you qualify for')
          ) :
          safeQualifiedJobs.length === 0 ? 
            React.createElement('div', { className: 'no-qualified-jobs' },
              React.createElement('h3', null, 'No Qualified Jobs'),
              React.createElement('p', null, 'No jobs match your qualifications at the moment')
            ) :
            React.createElement('div', { className: 'jobs-grid' },
              safeQualifiedJobs.map(job => 
                React.createElement('div', { key: job.id, className: 'job-card qualified' },
                  React.createElement('div', { className: 'job-header' },
                    React.createElement('h3', null, job.title),
                    React.createElement('span', { className: 'company' }, job.companyName)
                  ),
                  React.createElement('div', { className: 'job-details' },
                    React.createElement('div', { className: 'detail-item' },
                      React.createElement('span', { className: 'label' }, 'Type:'),
                      React.createElement('span', { className: 'value' }, job.type)
                    ),
                    React.createElement('div', { className: 'detail-item' },
                      React.createElement('span', { className: 'label' }, 'Salary:'),
                      React.createElement('span', { className: 'value' }, job.salary)
                    ),
                    React.createElement('div', { className: 'detail-item' },
                      React.createElement('span', { className: 'label' }, 'Location:'),
                      React.createElement('span', { className: 'value' }, job.location)
                    )
                  ),
                  React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: () => {
                      setSelectedJob(job);
                      setActiveTab('apply');
                    }
                  }, 'Apply Now')
                )
              )
            )
      ),

      activeTab === 'apply' && React.createElement('div', { className: 'apply-section' },
        React.createElement('h2', null, 'Apply for Job'),
        selectedJob ? 
          React.createElement('div', { className: 'apply-form' },
            React.createElement('div', { className: 'selected-job' },
              React.createElement('h3', null, selectedJob.title),
              React.createElement('p', { className: 'company' }, selectedJob.companyName),
              React.createElement('p', { className: 'location' }, selectedJob.location)
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Cover Letter'),
              React.createElement('textarea', {
                value: coverLetter,
                onChange: (e) => setCoverLetter(e.target.value),
                placeholder: 'Explain why you are interested in this position and why you would be a good fit...',
                rows: 8,
                required: true
              }),
              React.createElement('div', { className: 'character-count' },
                `${coverLetter.length} characters (minimum 2 required)`
              )
            ),
            React.createElement('div', { className: 'form-actions' },
              React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: () => setActiveTab('browse')
              }, 'Browse More Jobs'),
              React.createElement('button', {
                className: 'btn btn-primary',
                onClick: handleApplyJob,
                disabled: !coverLetter || coverLetter.length < 100
              }, 'Submit Application')
            )
          ) :
          React.createElement('div', { className: 'no-job-selected' },
            React.createElement('p', null, 'Please select a job to apply for'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: () => setActiveTab('browse')
            }, 'Browse Jobs')
          )
      ),

      activeTab === 'applications' && React.createElement('div', { className: 'applications-section' },
        React.createElement('h2', null, 'My Job Applications'),
        safeApplications.length === 0 ? 
          React.createElement('div', { className: 'no-applications' },
            React.createElement('p', null, 'You have not applied to any jobs yet'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: () => setActiveTab('browse')
            }, 'Browse Jobs')
          ) :
          React.createElement('div', { className: 'table-container' },
            React.createElement('table', null,
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Job Title'),
                  React.createElement('th', null, 'Company'),
                  React.createElement('th', null, 'Applied Date'),
                  React.createElement('th', null, 'Status'),
                  React.createElement('th', null, 'Actions')
                )
              ),
              React.createElement('tbody', null,
                safeApplications.map(application => 
                  React.createElement('tr', { key: application.id },
                    React.createElement('td', null, application.jobTitle),
                    React.createElement('td', null, application.companyName),
                    React.createElement('td', null, new Date(application.appliedAt).toLocaleDateString()),
                    React.createElement('td', null, getStatusBadge(application.status)),
                    React.createElement('td', null,
                      React.createElement('button', { className: 'btn btn-secondary btn-sm' }, 'View Details')
                    )
                  )
                )
              )
            )
          )
      )
    )
  );
};

export default GraduateJobPortal;