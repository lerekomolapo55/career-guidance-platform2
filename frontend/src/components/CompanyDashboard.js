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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id && user.userType === 'company') {
      setCompanyId(user.id);
      loadCompanyData(user.id);
    }
  }, []);

  const loadCompanyData = async (id) => {
    try {
      setLoading(true);
      
      const profileResponse = await companyAPI.getCompanyProfile(id);
      if (profileResponse) {
        setCompanyProfile(profileResponse);
      } else {
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

      const jobsResponse = await companyAPI.getCompanyJobs(id);
      if (jobsResponse) {
        setJobPostings(Array.isArray(jobsResponse) ? jobsResponse : []);
      }

    } catch (error) {
      console.error('Error loading company data:', error);
      alert('Error loading company data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    alert('Applicant Details:\n\nName: ' + applicant.name + '\nEmail: ' + applicant.email + '\nGPA: ' + applicant.gpa + '\nExperience: ' + applicant.experience + ' years\nEducation: ' + applicant.education + '\nCertificates: ' + (applicant.certificates ? applicant.certificates.join(', ') : 'None') + '\nSkills: ' + (applicant.skills ? applicant.skills.join(', ') : 'None') + '\nRelevance Score: ' + (applicant.relevanceScore || 'N/A') + '%');
  };

  const contactApplicant = (applicant) => {
    const subject = 'Interview Opportunity - ' + companyProfile.name;
    const body = 'Dear ' + applicant.name + ',\n\nWe were impressed by your profile and would like to invite you for an interview.\n\nBest regards,\n' + companyProfile.name;
    window.open('mailto:' + applicant.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body));
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
      alert('Job ' + status + ' successfully!');
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      React.createElement('div', { className: 'company-dashboard' },
        React.createElement('div', { className: 'loading' }, 'Loading...')
      )
    );
  }

  const renderDashboard = () => (
    React.createElement('div', { className: 'overview' },
      React.createElement('h2', null, 'Company Overview'),
      React.createElement('div', { className: 'stats-grid' },
        React.createElement('div', { className: 'stat-card' },
          React.createElement('h3', null, 'Active Jobs'),
          React.createElement('p', null, jobPostings.filter(job => job.status === 'active').length)
        ),
        React.createElement('div', { className: 'stat-card' },
          React.createElement('h3', null, 'Total Applicants'),
          React.createElement('p', null, applicants.length)
        ),
        React.createElement('div', { className: 'stat-card' },
          React.createElement('h3', null, 'Qualified Candidates'),
          React.createElement('p', null, filteredApplicants.length)
        )
      ),

      React.createElement('div', { className: 'recent-section' },
        React.createElement('div', { className: 'recent-jobs' },
          React.createElement('h3', null, 'Recent Job Postings'),
          jobPostings.length === 0 ? 
            React.createElement('p', { className: 'no-data' }, 'No job postings yet. Post your first job!') :
            jobPostings.slice(0, 3).map(job => 
              React.createElement('div', { key: job.id, className: 'job-item' },
                React.createElement('div', { className: 'job-header' },
                  React.createElement('h4', null, job.title),
                  React.createElement('span', { className: 'status ' + job.status }, job.status)
                ),
                React.createElement('p', null, 'Location: ' + job.location + ' | Type: ' + job.jobType),
                React.createElement('p', null, 'Applicants: ' + (job.applicants || 0) + ' | Posted: ' + (job.postedDate || new Date().toISOString().split('T')[0]))
              )
            )
        ),

        React.createElement('div', { className: 'recent-applicants' },
          React.createElement('h3', null, 'Top Qualified Applicants'),
          filteredApplicants.length === 0 ? 
            React.createElement('p', { className: 'no-data' }, 'No qualified applicants yet.') :
            filteredApplicants.slice(0, 3).map(applicant => 
              React.createElement('div', { key: applicant.id, className: 'applicant-item' },
                React.createElement('div', { className: 'applicant-header' },
                  React.createElement('h4', null, applicant.name),
                  React.createElement('span', { className: 'score' }, (applicant.relevanceScore || 'N/A') + '% match')
                ),
                React.createElement('p', null, applicant.education),
                React.createElement('p', null, 'GPA: ' + applicant.gpa + ' | Experience: ' + applicant.experience + ' years')
              )
            )
        )
      )
    )
  );

  const renderPostJob = () => (
    React.createElement('div', { className: 'post-job' },
      React.createElement('h2', null, 'Post New Job Opportunity'),
      React.createElement('form', { onSubmit: handleJobPost },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Job Title *'),
          React.createElement('input', {
            type: 'text',
            name: 'title',
            value: newJob.title,
            onChange: handleJobInputChange,
            placeholder: 'e.g., Software Developer',
            required: true
          })
        ),

        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Job Type *'),
            React.createElement('select', {
              name: 'jobType',
              value: newJob.jobType,
              onChange: handleJobInputChange,
              required: true
            },
              React.createElement('option', { value: 'Full-time' }, 'Full-time'),
              React.createElement('option', { value: 'Part-time' }, 'Part-time'),
              React.createElement('option', { value: 'Contract' }, 'Contract'),
              React.createElement('option', { value: 'Internship' }, 'Internship')
            )
          ),

          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Location *'),
            React.createElement('input', {
              type: 'text',
              name: 'location',
              value: newJob.location,
              onChange: handleJobInputChange,
              placeholder: 'e.g., Maseru, Lesotho',
              required: true
            })
          )
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Job Description *'),
          React.createElement('textarea', {
            name: 'description',
            value: newJob.description,
            onChange: handleJobInputChange,
            placeholder: 'Describe the role, responsibilities, and what you are looking for in a candidate...',
            rows: '4',
            required: true
          })
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Requirements *'),
          React.createElement('textarea', {
            name: 'requirements',
            value: newJob.requirements,
            onChange: handleJobInputChange,
            placeholder: 'List required skills, technologies, competencies...',
            rows: '3',
            required: true
          })
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Qualifications *'),
          React.createElement('input', {
            type: 'text',
            name: 'qualifications',
            value: newJob.qualifications,
            onChange: handleJobInputChange,
            placeholder: 'e.g., Bachelor Degree in Computer Science',
            required: true
          })
        ),

        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Minimum GPA'),
            React.createElement('input', {
              type: 'number',
              name: 'minGPA',
              value: newJob.minGPA,
              onChange: handleJobInputChange,
              min: '0',
              max: '4',
              step: '0.1',
              placeholder: '2.5'
            })
          ),

          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Required Experience (years)'),
            React.createElement('input', {
              type: 'number',
              name: 'requiredExperience',
              value: newJob.requiredExperience,
              onChange: handleJobInputChange,
              min: '0',
              placeholder: '1'
            })
          )
        ),

        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Required Certificates'),
            React.createElement('input', {
              type: 'text',
              name: 'requiredCertificates',
              value: newJob.requiredCertificates,
              onChange: handleJobInputChange,
              placeholder: 'e.g., AWS Certified, Microsoft Certified'
            })
          ),

          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Application Deadline *'),
            React.createElement('input', {
              type: 'date',
              name: 'deadline',
              value: newJob.deadline,
              onChange: handleJobInputChange,
              required: true
            })
          )
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Salary Range'),
          React.createElement('input', {
            type: 'text',
            name: 'salary',
            value: newJob.salary,
            onChange: handleJobInputChange,
            placeholder: 'e.g., M15,000 - M20,000'
          })
        ),

        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', { 
            type: 'submit', 
            className: 'submit-btn', 
            disabled: loading 
          }, loading ? 'Posting...' : 'Post Job'),
          React.createElement('button', { 
            type: 'button', 
            className: 'cancel-btn', 
            onClick: () => setActiveTab('dashboard') 
          }, 'Cancel')
        )
      )
    )
  );

  const renderManageJobs = () => (
    React.createElement('div', { className: 'jobs-management' },
      React.createElement('h2', null, 'Manage Job Postings'),
      React.createElement('div', { className: 'jobs-list' },
        jobPostings.length === 0 ? 
          React.createElement('div', { className: 'no-jobs' },
            React.createElement('p', null, 'No job postings yet.'),
            React.createElement('button', { 
              className: 'post-first-job', 
              onClick: () => setActiveTab('post-job') 
            }, 'Post Your First Job')
          ) :
          jobPostings.map(job => 
            React.createElement('div', { key: job.id, className: 'job-card' },
              React.createElement('div', { className: 'job-card-header' },
                React.createElement('h3', null, job.title),
                React.createElement('span', { className: 'status-badge ' + job.status }, job.status)
              ),
              React.createElement('div', { className: 'job-details' },
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Type:'), ' ' + job.jobType),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Location:'), ' ' + job.location),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Salary:'), ' ' + (job.salary || 'Not specified')),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Posted:'), ' ' + (job.postedDate || new Date().toISOString().split('T')[0])),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Deadline:'), ' ' + job.deadline),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Applicants:'), ' ' + (job.applicants || 0))
              ),
              React.createElement('div', { className: 'job-actions' },
                React.createElement('button', { className: 'view-btn' }, 'View Details'),
                React.createElement('button', {
                  className: 'status-btn',
                  onClick: () => updateJobStatus(job.id, job.status === 'active' ? 'closed' : 'active'),
                  disabled: loading
                }, job.status === 'active' ? 'Close Job' : 'Activate Job'),
                React.createElement('button', {
                  className: 'delete-btn',
                  onClick: () => deleteJob(job.id),
                  disabled: loading
                }, 'Delete')
              )
            )
          )
      )
    )
  );

  const renderApplicants = () => (
    React.createElement('div', { className: 'applicants' },
      React.createElement('h2', null, 'Qualified Applicants Ready for Interview'),
      React.createElement('p', { className: 'applicants-subtitle' },
        'These candidates meet all your job requirements and are ready for interview consideration.'
      ),
      React.createElement('div', { className: 'applicants-list' },
        filteredApplicants.length === 0 ? 
          React.createElement('div', { className: 'no-applicants' },
            React.createElement('p', null, 'No qualified applicants found matching your current job requirements.'),
            React.createElement('p', null, 'Applicants are automatically filtered based on:'),
            React.createElement('ul', null,
              React.createElement('li', null, 'Academic performance (GPA 2.5+)'),
              React.createElement('li', null, 'Relevant certificates'),
              React.createElement('li', null, 'Work experience (1+ years)'),
              React.createElement('li', null, 'Relevance to your job posts')
            )
          ) :
          filteredApplicants.map(applicant => 
            React.createElement('div', { key: applicant.id, className: 'applicant-card' },
              React.createElement('div', { className: 'applicant-header' },
                React.createElement('h3', null, applicant.name),
                React.createElement('div', { className: 'applicant-score' },
                  React.createElement('span', { className: 'score' }, (applicant.relevanceScore || 'N/A') + '% Match')
                )
              ),
              React.createElement('div', { className: 'applicant-info' },
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Email:'), ' ' + applicant.email),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Education:'), ' ' + applicant.education),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'GPA:'), ' ' + applicant.gpa + '/4.0'),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Experience:'), ' ' + applicant.experience + ' years'),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Certificates:'), ' ' + (applicant.certificates ? applicant.certificates.join(', ') : 'None')),
                React.createElement('p', null, 
                  React.createElement('strong', null, 'Skills:'), ' ' + (applicant.skills ? applicant.skills.join(', ') : 'None'))
              ),
              React.createElement('div', { className: 'applicant-actions' },
                React.createElement('button', {
                  className: 'view-details-btn',
                  onClick: () => viewApplicantDetails(applicant)
                }, 'View Full Details'),
                React.createElement('button', {
                  className: 'contact-btn',
                  onClick: () => contactApplicant(applicant)
                }, 'Contact for Interview')
              )
            )
          )
      )
    )
  );

  const renderProfile = () => (
    React.createElement('div', { className: 'profile' },
      React.createElement('h2', null, 'Company Profile'),
      React.createElement('form', { onSubmit: handleProfileUpdate },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Company Name *'),
          React.createElement('input', {
            type: 'text',
            name: 'name',
            value: companyProfile.name,
            onChange: handleInputChange,
            required: true
          })
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Industry *'),
          React.createElement('input', {
            type: 'text',
            name: 'industry',
            value: companyProfile.industry,
            onChange: handleInputChange,
            required: true
          })
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Company Description'),
          React.createElement('textarea', {
            name: 'description',
            value: companyProfile.description,
            onChange: handleInputChange,
            rows: '4',
            placeholder: 'Describe your company, mission, and values...'
          })
        ),

        React.createElement('div', { className: 'form-row' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Contact Email *'),
            React.createElement('input', {
              type: 'email',
              name: 'contactEmail',
              value: companyProfile.contactEmail,
              onChange: handleInputChange,
              required: true
            })
          ),

          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Phone'),
            React.createElement('input', {
              type: 'tel',
              name: 'phone',
              value: companyProfile.phone,
              onChange: handleInputChange
            })
          )
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Address'),
          React.createElement('input', {
            type: 'text',
            name: 'address',
            value: companyProfile.address,
            onChange: handleInputChange
          })
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', null, 'Website'),
          React.createElement('input', {
            type: 'url',
            name: 'website',
            value: companyProfile.website,
            onChange: handleInputChange,
            placeholder: 'https://www.example.com'
          })
        ),

        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', { 
            type: 'submit', 
            className: 'submit-btn', 
            disabled: loading 
          }, loading ? 'Updating...' : 'Update Profile'),
          React.createElement('button', { 
            type: 'button', 
            className: 'cancel-btn', 
            onClick: () => setActiveTab('dashboard') 
          }, 'Cancel')
        )
      )
    )
  );

  return (
    React.createElement('div', { className: 'company-dashboard' },
      React.createElement('div', { className: 'dashboard-header' },
        React.createElement('h1', null, 'Company Dashboard'),
        React.createElement('p', null, 'Welcome, ' + companyProfile.name)
      ),

      React.createElement('div', { className: 'dashboard-nav' },
        React.createElement('button', {
          className: activeTab === 'dashboard' ? 'active' : '',
          onClick: () => setActiveTab('dashboard')
        }, 'Dashboard'),
        React.createElement('button', {
          className: activeTab === 'post-job' ? 'active' : '',
          onClick: () => setActiveTab('post-job')
        }, 'Post Job'),
        React.createElement('button', {
          className: activeTab === 'jobs' ? 'active' : '',
          onClick: () => setActiveTab('jobs')
        }, 'Manage Jobs (' + jobPostings.length + ')'),
        React.createElement('button', {
          className: activeTab === 'applicants' ? 'active' : '',
          onClick: () => setActiveTab('applicants')
        }, 'Qualified Applicants (' + filteredApplicants.length + ')'),
        React.createElement('button', {
          className: activeTab === 'profile' ? 'active' : '',
          onClick: () => setActiveTab('profile')
        }, 'Company Profile')
      ),

      React.createElement('div', { className: 'dashboard-content' },
        activeTab === 'dashboard' && renderDashboard(),
        activeTab === 'post-job' && renderPostJob(),
        activeTab === 'jobs' && renderManageJobs(),
        activeTab === 'applicants' && renderApplicants(),
        activeTab === 'profile' && renderProfile()
      )
    )
  );
};

export default CompanyDashboard;