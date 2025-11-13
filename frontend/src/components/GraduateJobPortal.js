import React, { useState, useEffect } from 'react';
import { graduateAPI, studentAPI } from './api';
import './GraduateJobPortal.css';

const GraduateJobPortal = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [transcripts, setTranscripts] = useState([]);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [qualifiedJobs, setQualifiedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const certificateHierarchy = [
    { level: 'JC', name: 'Junior Certificate', credits: 0, description: 'Basic secondary education completion' },
    { level: 'LGCSE', name: 'Lesotho General Certificate of Secondary Education', credits: 5, description: 'Ordinary level secondary education' },
    { level: 'COSC', name: 'Cambridge Overseas School Certificate', credits: 8, description: 'Advanced level secondary education' },
    { level: 'CERTIFICATE', name: 'Certificate (Post-Secondary)', credits: 12, description: '1-year post-secondary certificate program' },
    { level: 'DIPLOMA', name: 'Diploma', credits: 24, description: '2-year diploma program' },
    { level: 'BACHELORS', name: 'Bachelor\'s Degree', credits: 36, description: '3-4 year undergraduate degree' },
    { level: 'HONOURS', name: 'Bachelor\'s Degree (Honours)', credits: 42, description: '4-year honours degree' },
    { level: 'MASTERS', name: 'Master\'s Degree', credits: 54, description: 'Postgraduate master\'s degree' },
    { level: 'PHD', name: 'Doctoral Degree', credits: 72, description: 'Doctor of Philosophy degree' }
  ];

  useEffect(function() {
    if (user) {
      fetchJobs();
      fetchApplications();
      fetchTranscripts();
      fetchStudentCertificates();
    }
  }, [user]);

  useEffect(function() {
    if (selectedCertificates.length > 0) {
      fetchQualifiedJobs();
    }
  }, [selectedCertificates]);

  const fetchJobs = async function() {
    try {
      const jobsData = await graduateAPI.getJobs();
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchQualifiedJobs = async function() {
    try {
      setLoading(true);
      const qualifiedJobsData = await graduateAPI.getQualifiedJobs(user.id);
      setQualifiedJobs(Array.isArray(qualifiedJobsData) ? qualifiedJobsData : []);
      setMessage('Found ' + qualifiedJobsData.length + ' qualified jobs');
    } catch (error) {
      console.error('Error fetching qualified jobs:', error);
      setQualifiedJobs([]);
      setMessage('Error fetching qualified jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async function() {
    try {
      const applicationsData = await graduateAPI.getApplications(user.id);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchTranscripts = async function() {
    try {
      const transcriptsData = await studentAPI.getTranscripts(user.id);
      setTranscripts(Array.isArray(transcriptsData) ? transcriptsData : []);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      setTranscripts([]);
    }
  };

  const fetchStudentCertificates = async function() {
    try {
      const certificatesData = await graduateAPI.getStudentCertificates(user.id);
      if (Array.isArray(certificatesData) && certificatesData.length > 0) {
        setSelectedCertificates(certificatesData);
      }
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      setSelectedCertificates([]);
    }
  };

  const handleFileUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const base64 = e.target.result;
        await studentAPI.uploadTranscript({
          studentId: user.id,
          studentType: user.studentType,
          fileName: file.name,
          fileData: base64
        });
        
        await fetchTranscripts();
        setMessage('Transcript uploaded successfully');
        setUploading(false);
        
        if (transcripts.length === 0) {
          setActiveTab('certificates');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading transcript:', error);
      setMessage('Error uploading transcript: ' + error.message);
      setUploading(false);
    }
  };

  const handleDeleteTranscript = async function(transcriptId) {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        await studentAPI.deleteTranscript(transcriptId);
        await fetchTranscripts();
        setMessage('Transcript deleted successfully');
      } catch (error) {
        console.error('Error deleting transcript:', error);
        setMessage('Error deleting transcript: ' + error.message);
      }
    }
  };

  const handleViewTranscript = function(transcriptId) {
    window.open('/api/student/transcript-file/' + transcriptId, '_blank');
  };

  const handleCertificateToggle = function(certificate) {
    const isSelected = selectedCertificates.some(function(cert) { 
      return cert.level === certificate.level; 
    });
    
    if (isSelected) {
      setSelectedCertificates(selectedCertificates.filter(function(cert) { 
        return cert.level !== certificate.level; 
      }));
    } else {
      const newCertificate = {
        level: certificate.level,
        name: certificate.name,
        credits: certificate.credits,
        description: certificate.description,
        completionYear: new Date().getFullYear()
      };
      
      setSelectedCertificates([...selectedCertificates, newCertificate]);
    }
  };

  const handleSaveCertificates = async function() {
    if (selectedCertificates.length === 0) {
      setMessage('Please select at least one certificate');
      return;
    }

    try {
      await graduateAPI.saveStudentCertificates(user.id, selectedCertificates);
      setMessage('Certificates saved successfully');
      setActiveTab('jobs');
      await fetchQualifiedJobs();
    } catch (error) {
      console.error('Error saving certificates:', error);
      setMessage('Error saving certificates: ' + error.message);
    }
  };

  const handleApplyJob = async function() {
    if (!selectedJob || !coverLetter) {
      setMessage('Please select a job and provide a cover letter');
      return;
    }

    try {
      await graduateAPI.applyJob({
        studentId: user.id,
        jobId: selectedJob.id,
        companyId: selectedJob.companyId,
        coverLetter: coverLetter,
        selectedCertificates: selectedCertificates
      });

      await fetchApplications();
      setCoverLetter('');
      setSelectedJob(null);
      setMessage('Job application submitted successfully');
      setActiveTab('applications');
    } catch (error) {
      setMessage('Failed to submit application: ' + error.message);
    }
  };

  const getStatusBadge = function(status) {
    const statusClass = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    }[status] || 'status-pending';

    return React.createElement('span', { className: 'status-badge ' + statusClass }, status);
  };

  const getMatchScoreBadge = function(score) {
    let colorClass = 'match-low';
    if (score >= 80) colorClass = 'match-high';
    else if (score >= 60) colorClass = 'match-medium';
    
    return React.createElement('span', { className: 'match-badge ' + colorClass }, score + '% Match');
  };

  const totalCredits = selectedCertificates.reduce(function(sum, cert) { 
    return sum + cert.credits; 
  }, 0);
  
  const highestCertificate = selectedCertificates.length > 0 
    ? selectedCertificates.reduce(function(highest, current) { 
        return certificateHierarchy.findIndex(function(cert) { 
          return cert.level === current.level; 
        }) > certificateHierarchy.findIndex(function(cert) { 
          return cert.level === highest.level; 
        }) ? current : highest;
      })
    : null;

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
      className: 'message ' + (message.includes('Error') || message.includes('Failed') ? 'error' : 'success') 
    }, message),

    React.createElement('div', { className: 'application-steps' },
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'upload' ? 'active' : '') + ' ' + (safeTranscripts.length > 0 ? 'completed' : ''),
        onClick: function() { setActiveTab('upload'); }
      },
        React.createElement('div', { className: 'step-number' }, '1'),
        React.createElement('div', { className: 'step-label' }, 'Upload Transcript')
      ),
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'certificates' ? 'active' : '') + ' ' + (selectedCertificates.length > 0 ? 'completed' : ''),
        onClick: function() { safeTranscripts.length > 0 && setActiveTab('certificates'); }
      },
        React.createElement('div', { className: 'step-number' }, '2'),
        React.createElement('div', { className: 'step-label' }, 'Select Certificates')
      ),
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'jobs' ? 'active' : '') + ' ' + (safeQualifiedJobs.length > 0 ? 'completed' : ''),
        onClick: function() { selectedCertificates.length > 0 && setActiveTab('jobs'); }
      },
        React.createElement('div', { className: 'step-number' }, '3'),
        React.createElement('div', { className: 'step-label' }, 'Apply to Jobs')
      ),
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'applications' ? 'active' : ''),
        onClick: function() { setActiveTab('applications'); }
      },
        React.createElement('div', { className: 'step-number' }, '4'),
        React.createElement('div', { className: 'step-label' }, 'My Applications')
      )
    ),

    React.createElement('div', { className: 'tab-content' },
      
      activeTab === 'upload' && React.createElement('div', { className: 'upload-section' },
        React.createElement('h2', null, 'Upload Your Academic Transcript'),
        React.createElement('div', { className: 'upload-area' },
          React.createElement('input', {
            type: 'file',
            id: 'transcript-upload',
            accept: 'application/pdf',
            onChange: handleFileUpload,
            disabled: uploading,
            style: { display: 'none' }
          }),
          React.createElement('label', {
            htmlFor: 'transcript-upload',
            className: 'upload-label ' + (uploading ? 'uploading' : '')
          },
            uploading ? 
              React.createElement('div', { className: 'uploading-spinner' }, 'Uploading...') :
              React.createElement('div', null,
                React.createElement('div', { className: 'upload-icon' }, 'PDF'),
                React.createElement('h3', null, 'Upload PDF Transcript'),
                React.createElement('p', null, 'Click to upload your academic transcript in PDF format'),
                React.createElement('p', { className: 'upload-note' }, 'Maximum file size: 10MB')
              )
          )
        ),

        safeTranscripts.length > 0 && React.createElement('div', { className: 'transcripts-list' },
          React.createElement('h3', null, 'Your Transcripts'),
          safeTranscripts.map(function(transcript) {
            return React.createElement('div', { key: transcript.id, className: 'transcript-item' },
              React.createElement('div', { className: 'transcript-info' },
                React.createElement('h4', null, transcript.fileName),
                React.createElement('p', null, 
                  'Uploaded: ', new Date(transcript.uploadedAt).toLocaleDateString()
                ),
                React.createElement('p', { className: 'status' }, 
                  'Status: ', React.createElement('span', { className: 'verified' }, 'Verified')
                )
              ),
              React.createElement('div', { className: 'transcript-actions' },
                React.createElement('button', {
                  className: 'btn btn-secondary btn-sm',
                  onClick: function() { handleViewTranscript(transcript.id); }
                }, 'View PDF'),
                React.createElement('button', {
                  className: 'btn btn-danger btn-sm',
                  onClick: function() { handleDeleteTranscript(transcript.id); }
                }, 'Delete')
              )
            );
          })
        ),

        safeTranscripts.length > 0 && React.createElement('div', { className: 'step-actions' },
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: function() { setActiveTab('certificates'); }
          }, 'Continue to Step 2: Select Certificates')
        )
      ),

      activeTab === 'certificates' && React.createElement('div', { className: 'certificates-section' },
        React.createElement('h2', null, 'Select Your Academic Certificates'),
        React.createElement('p', { className: 'section-description' }, 
          'Select all the academic certificates you have earned. This will be used to determine which jobs you qualify for.'
        ),

        React.createElement('div', { className: 'certificates-summary' },
          React.createElement('div', { className: 'summary-card' },
            React.createElement('h3', null, 'Total Certificates'),
            React.createElement('div', { className: 'summary-value' }, selectedCertificates.length)
          ),
          React.createElement('div', { className: 'summary-card' },
            React.createElement('h3', null, 'Total Credits'),
            React.createElement('div', { className: 'summary-value' }, totalCredits)
          ),
          React.createElement('div', { className: 'summary-card' },
            React.createElement('h3', null, 'Highest Qualification'),
            React.createElement('div', { className: 'summary-value' }, 
              highestCertificate ? highestCertificate.name : 'None'
            )
          )
        ),

        React.createElement('div', { className: 'certificates-grid' },
          certificateHierarchy.map(function(certificate) {
            const isSelected = selectedCertificates.some(function(cert) { 
              return cert.level === certificate.level; 
            });
            return React.createElement('div', { 
              key: certificate.level,
              className: 'certificate-card ' + (isSelected ? 'selected' : ''),
              onClick: function() { handleCertificateToggle(certificate); }
            },
              React.createElement('div', { className: 'certificate-header' },
                React.createElement('div', { className: 'certificate-checkbox' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: isSelected,
                    readOnly: true,
                    className: 'checkbox'
                  })
                ),
                React.createElement('div', { className: 'certificate-info' },
                  React.createElement('h3', null, certificate.name),
                  React.createElement('p', { className: 'certificate-level' }, certificate.level),
                  React.createElement('p', { className: 'certificate-description' }, certificate.description)
                )
              ),
              React.createElement('div', { className: 'certificate-details' },
                React.createElement('div', { className: 'detail-item' },
                  React.createElement('span', { className: 'label' }, 'Credits:'),
                  React.createElement('span', { className: 'value' }, certificate.credits)
                ),
                React.createElement('div', { className: 'detail-item' },
                  React.createElement('span', { className: 'label' }, 'Level:'),
                  React.createElement('span', { className: 'value' }, 
                    certificateHierarchy.findIndex(function(cert) { 
                      return cert.level === certificate.level; 
                    }) + 1
                  )
                )
              )
            );
          })
        ),

        React.createElement('div', { className: 'step-actions' },
          React.createElement('button', {
            className: 'btn btn-secondary',
            onClick: function() { setActiveTab('upload'); }
          }, 'Back to Transcripts'),
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: handleSaveCertificates,
            disabled: selectedCertificates.length === 0
          }, 'Save Certificates and Find Jobs')
        )
      ),

      activeTab === 'jobs' && React.createElement('div', { className: 'jobs-section' },
        React.createElement('h2', null, 'Jobs You Qualify For'),
        React.createElement('p', { className: 'section-description' }, 
          'Based on your selected certificates, you qualify for ' + safeQualifiedJobs.length + ' jobs.'
        ),

        loading ? 
          React.createElement('div', { className: 'loading' }, 'Finding qualified jobs...') :
          safeQualifiedJobs.length === 0 ?
            React.createElement('div', { className: 'no-jobs' },
              React.createElement('h3', null, 'No Qualified Jobs Found'),
              React.createElement('p', null, 
                'No jobs match your current certificate selection. You may need to upload additional certificates.'
              ),
              React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: function() { setActiveTab('certificates'); }
              }, 'Back to Certificates')
            ) :
            React.createElement('div', null,
              React.createElement('div', { className: 'jobs-grid' },
                safeQualifiedJobs.map(function(job) {
                  return React.createElement('div', { key: job.id, className: 'job-card qualified' },
                    React.createElement('div', { className: 'job-header' },
                      React.createElement('h3', null, job.title),
                      React.createElement('div', { className: 'job-meta' },
                        React.createElement('span', { className: 'company' }, job.companyName),
                        job.matchScore && getMatchScoreBadge(job.matchScore)
                      )
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
                    React.createElement('div', { className: 'job-requirements' },
                      React.createElement('h4', null, 'Requirements'),
                      React.createElement('p', null, 
                        'Minimum Qualification: ' + job.requirements.minQualification,
                        React.createElement('br', null),
                        'Required Experience: ' + job.requirements.experience,
                        React.createElement('br', null),
                        'Skills: ' + job.requirements.skills.join(', ')
                      )
                    ),
                    React.createElement('button', {
                      className: 'btn btn-primary',
                      onClick: function() {
                        setSelectedJob(job);
                        setActiveTab('apply');
                      }
                    }, 'Apply Now')
                  );
                })
              )
            )
      ),

      activeTab === 'apply' && selectedJob && React.createElement('div', { className: 'apply-section' },
        React.createElement('h2', null, 'Apply for Job'),
        React.createElement('div', { className: 'apply-form' },
          React.createElement('div', { className: 'selected-job' },
            React.createElement('h3', null, selectedJob.title),
            React.createElement('p', { className: 'company' }, selectedJob.companyName),
            React.createElement('p', { className: 'location' }, selectedJob.location),
            React.createElement('p', { className: 'match-score' }, 
              'Your qualification match: ' + selectedJob.matchScore + '%'
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Cover Letter'),
            React.createElement('textarea', {
              value: coverLetter,
              onChange: function(e) { setCoverLetter(e.target.value); },
              placeholder: 'Explain why you are interested in this position and why you would be a good fit...',
              rows: 8,
              required: true
            }),
            React.createElement('div', { className: 'character-count' },
              coverLetter.length + ' characters (minimum 100 required)'
            )
          ),
          React.createElement('div', { className: 'form-actions' },
            React.createElement('button', {
              className: 'btn btn-secondary',
              onClick: function() { setActiveTab('jobs'); }
            }, 'Back to Jobs'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: handleApplyJob,
              disabled: !coverLetter || coverLetter.length < 100
            }, 'Submit Application')
          )
        )
      ),

      activeTab === 'applications' && React.createElement('div', { className: 'applications-section' },
        React.createElement('h2', null, 'My Job Applications'),
        safeApplications.length === 0 ? 
          React.createElement('div', { className: 'no-applications' },
            React.createElement('p', null, 'You have not applied to any jobs yet'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: function() { setActiveTab('jobs'); }
            }, 'Browse Qualified Jobs')
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
                safeApplications.map(function(application) {
                  return React.createElement('tr', { key: application.id },
                    React.createElement('td', null, application.jobTitle),
                    React.createElement('td', null, application.companyName),
                    React.createElement('td', null, new Date(application.appliedAt).toLocaleDateString()),
                    React.createElement('td', null, getStatusBadge(application.status)),
                    React.createElement('td', null,
                      React.createElement('button', { 
                        className: 'btn btn-secondary btn-sm',
                        onClick: function() {
                          console.log('View application details:', application.id);
                        }
                      }, 'View Details')
                    )
                  );
                })
              )
            )
          )
      )
    )
  );
};

export default GraduateJobPortal;