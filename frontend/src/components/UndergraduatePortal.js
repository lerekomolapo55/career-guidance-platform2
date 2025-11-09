import React, { useState, useEffect } from 'react';
import { studentAPI, generalAPI } from './api';
import './UndergraduatePortal.css';

const UndergraduatePortal = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [qualifiedCourses, setQualifiedCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [personalStatement, setPersonalStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchApplications();
      fetchTranscripts();
      fetchUniversities();
    }
  }, [user]);

  useEffect(() => {
    if (transcripts.length > 0) {
      fetchQualifiedCourses();
    }
  }, [transcripts]);

  const fetchCourses = async () => {
    try {
      const coursesData = await generalAPI.getUndergraduateCourses();
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchQualifiedCourses = async () => {
    try {
      const response = await studentAPI.getQualifiedCourses(user.id);
      const qualifiedCoursesData = response.qualifiedCourses || [];
      setQualifiedCourses(Array.isArray(qualifiedCoursesData) ? qualifiedCoursesData : []);
    } catch (error) {
      console.error('Error fetching qualified courses:', error);
      setQualifiedCourses([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsData = await studentAPI.getApplications(user.id);
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

  const fetchUniversities = async () => {
    try {
      const universitiesData = await generalAPI.getUniversities();
      setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([]);
    }
  };

  const handleApplyCourse = async () => {
    if (!selectedCourse || !personalStatement) {
      setMessage('Please select a course and provide a personal statement');
      return;
    }

    try {
      await studentAPI.applyCourse({
        studentId: user.id,
        courseId: selectedCourse.id,
        institutionId: selectedCourse.institutionId,
        personalStatement: personalStatement
      });

      await fetchApplications();
      setPersonalStatement('');
      setSelectedCourse(null);
      setMessage('Course application submitted successfully');
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

  const getMatchScoreBadge = (score) => {
    let colorClass = 'match-low';
    if (score >= 80) colorClass = 'match-high';
    else if (score >= 60) colorClass = 'match-medium';
    
    return React.createElement('span', { className: `match-badge ${colorClass}` }, `${score}% Match`);
  };

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeQualifiedCourses = Array.isArray(qualifiedCourses) ? qualifiedCourses : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeTranscripts = Array.isArray(transcripts) ? transcripts : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];

  return React.createElement('div', { className: 'undergraduate-portal' },
    React.createElement('div', { className: 'portal-header' },
      React.createElement('h1', null, 'Undergraduate Portal'),
      React.createElement('p', null, 'Discover and apply for undergraduate courses in Lesotho')
    ),

    message && React.createElement('div', { 
      className: `message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}` 
    }, message),

    React.createElement('div', { className: 'portal-tabs' },
      React.createElement('button', {
        className: `tab-button ${activeTab === 'browse' ? 'active' : ''}`,
        onClick: () => setActiveTab('browse')
      }, 'Browse All Courses'),
      React.createElement('button', {
        className: `tab-button ${activeTab === 'qualified' ? 'active' : ''}`,
        onClick: () => setActiveTab('qualified')
      }, `Qualified Courses (${safeQualifiedCourses.length})`),
      React.createElement('button', {
        className: `tab-button ${activeTab === 'universities' ? 'active' : ''}`,
        onClick: () => setActiveTab('universities')
      }, `Universities (${safeUniversities.length})`),
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
      activeTab === 'browse' && React.createElement('div', { className: 'browse-courses' },
        React.createElement('h2', null, 'All Undergraduate Courses'),
        React.createElement('div', { className: 'courses-grid' },
          safeCourses.length === 0 ? 
            React.createElement('div', { className: 'no-courses' },
              React.createElement('p', null, 'No courses available at the moment')
            ) :
            safeCourses.map(course => 
              React.createElement('div', { key: course.id, className: 'course-card' },
                React.createElement('div', { className: 'course-header' },
                  React.createElement('h3', null, course.name),
                  React.createElement('span', { className: 'institution' }, course.institutionName)
                ),
                React.createElement('div', { className: 'course-details' },
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Faculty:'),
                    React.createElement('span', { className: 'value' }, course.faculty)
                  ),
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Duration:'),
                    React.createElement('span', { className: 'value' }, course.duration)
                  ),
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Fees:'),
                    React.createElement('span', { className: 'value' }, `M${course.fees}/year`)
                  ),
                  React.createElement('div', { className: 'detail-item' },
                    React.createElement('span', { className: 'label' }, 'Credits:'),
                    React.createElement('span', { className: 'value' }, course.credits)
                  )
                ),
                React.createElement('div', { className: 'course-requirements' },
                  React.createElement('h4', null, 'Requirements'),
                  React.createElement('p', null, course.requirements)
                ),
                React.createElement('button', {
                  className: 'btn btn-primary',
                  onClick: () => {
                    setSelectedCourse(course);
                    setActiveTab('apply');
                  }
                }, 'Apply Now')
              )
            )
        )
      ),

      activeTab === 'qualified' && React.createElement('div', { className: 'qualified-courses' },
        React.createElement('h2', null, 'Courses You Qualify For'),
        safeTranscripts.length === 0 ? 
          React.createElement('div', { className: 'no-transcripts' },
            React.createElement('h3', null, 'Transcripts Required'),
            React.createElement('p', null, 'Upload your academic transcripts to see courses you qualify for')
          ) :
          safeQualifiedCourses.length === 0 ? 
            React.createElement('div', { className: 'no-qualified-courses' },
              React.createElement('h3', null, 'No Qualified Courses'),
              React.createElement('p', null, 'No courses match your qualifications at the moment')
            ) :
            React.createElement('div', { className: 'courses-grid' },
              safeQualifiedCourses.map(course => 
                React.createElement('div', { key: course.id, className: 'course-card qualified' },
                  React.createElement('div', { className: 'course-header' },
                    React.createElement('h3', null, course.name),
                    React.createElement('div', { className: 'course-meta' },
                      React.createElement('span', { className: 'institution' }, course.institutionName),
                      course.matchScore && getMatchScoreBadge(course.matchScore)
                    )
                  ),
                  React.createElement('div', { className: 'course-details' },
                    React.createElement('div', { className: 'detail-item' },
                      React.createElement('span', { className: 'label' }, 'Faculty:'),
                      React.createElement('span', { className: 'value' }, course.faculty)
                    ),
                    React.createElement('div', { className: 'detail-item' },
                      React.createElement('span', { className: 'label' }, 'Duration:'),
                      React.createElement('span', { className: 'value' }, course.duration)
                    ),
                    React.createElement('div', { className: 'detail-item' },
                      React.createElement('span', { className: 'label' }, 'Fees:'),
                      React.createElement('span', { className: 'value' }, `M${course.fees}/year`)
                    )
                  ),
                  React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: () => {
                      setSelectedCourse(course);
                      setActiveTab('apply');
                    }
                  }, 'Apply Now')
                )
              )
            )
      ),

      activeTab === 'universities' && React.createElement('div', { className: 'universities-section' },
        React.createElement('h2', null, 'Universities in Lesotho'),
        React.createElement('div', { className: 'universities-grid' },
          safeUniversities.length === 0 ? 
            React.createElement('div', { className: 'no-universities' },
              React.createElement('p', null, 'No universities available')
            ) :
            safeUniversities.map(university => 
              React.createElement('div', { key: university.id, className: 'university-card' },
                React.createElement('div', { className: 'university-header' },
                  React.createElement('h3', null, university.name),
                  React.createElement('span', { className: 'type' }, university.type)
                ),
                React.createElement('div', { className: 'university-details' },
                  React.createElement('p', null, React.createElement('strong', null, 'Location: '), university.location),
                  React.createElement('p', null, React.createElement('strong', null, 'Established: '), university.established),
                  React.createElement('p', null, React.createElement('strong', null, 'Contact: '), university.contact?.email)
                ),
                React.createElement('div', { className: 'university-description' },
                  React.createElement('p', null, university.description)
                )
              )
            )
        )
      ),

      activeTab === 'apply' && React.createElement('div', { className: 'apply-section' },
        React.createElement('h2', null, 'Apply for Course'),
        selectedCourse ? 
          React.createElement('div', { className: 'apply-form' },
            React.createElement('div', { className: 'selected-course' },
              React.createElement('h3', null, selectedCourse.name),
              React.createElement('p', { className: 'institution' }, selectedCourse.institutionName),
              React.createElement('p', { className: 'faculty' }, selectedCourse.faculty)
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', null, 'Personal Statement'),
              React.createElement('textarea', {
                value: personalStatement,
                onChange: (e) => setPersonalStatement(e.target.value),
                placeholder: 'Explain why you are interested in this course and why you would be a good candidate...',
                rows: 8,
                required: true
              }),
              React.createElement('div', { className: 'character-count' },
                `${personalStatement.length} characters (minimum 2 required)`
              )
            ),
            React.createElement('div', { className: 'form-actions' },
              React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: () => setActiveTab('browse')
              }, 'Browse More Courses'),
              React.createElement('button', {
                className: 'btn btn-primary',
                onClick: handleApplyCourse,
                disabled: !personalStatement || personalStatement.length < 100
              }, 'Submit Application')
            )
          ) :
          React.createElement('div', { className: 'no-course-selected' },
            React.createElement('p', null, 'Please select a course to apply for'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: () => setActiveTab('browse')
            }, 'Browse Courses')
          )
      ),

      activeTab === 'applications' && React.createElement('div', { className: 'applications-section' },
        React.createElement('h2', null, 'My Course Applications'),
        safeApplications.length === 0 ? 
          React.createElement('div', { className: 'no-applications' },
            React.createElement('p', null, 'You have not applied to any courses yet'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: () => setActiveTab('browse')
            }, 'Browse Courses')
          ) :
          React.createElement('div', { className: 'table-container' },
            React.createElement('table', null,
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Course'),
                  React.createElement('th', null, 'Institution'),
                  React.createElement('th', null, 'Applied Date'),
                  React.createElement('th', null, 'Status'),
                  React.createElement('th', null, 'Actions')
                )
              ),
              React.createElement('tbody', null,
                safeApplications.map(application => 
                  React.createElement('tr', { key: application.id },
                    React.createElement('td', null, application.courseName),
                    React.createElement('td', null, application.institutionName),
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

export default UndergraduatePortal;