import React, { useState, useEffect } from 'react';
import { studentAPI, generalAPI } from './api';
import './UndergraduatePortal.css';

const UndergraduatePortal = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [transcripts, setTranscripts] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [qualifiedCourses, setQualifiedCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [personalStatement, setPersonalStatement] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const lesothoSubjects = [
    { subject: 'English Language', credits: 4 },
    { subject: 'Sesotho Language', credits: 4 },
    { subject: 'Mathematics', credits: 4 },
    { subject: 'Additional Mathematics', credits: 4 },
    { subject: 'Physical Science', credits: 4 },
    { subject: 'Biology', credits: 4 },
    { subject: 'Chemistry', credits: 4 },
    { subject: 'Physics', credits: 4 },
    { subject: 'Geography', credits: 3 },
    { subject: 'History', credits: 3 },
    { subject: 'Development Studies', credits: 3 },
    { subject: 'Accounting', credits: 4 },
    { subject: 'Commerce', credits: 3 },
    { subject: 'Economics', credits: 4 },
    { subject: 'Business Studies', credits: 3 },
    { subject: 'Computer Studies', credits: 3 },
    { subject: 'Agricultural Science', credits: 3 },
    { subject: 'Home Economics', credits: 3 },
    { subject: 'Religious Studies', credits: 2 },
    { subject: 'Moral Education', credits: 2 },
    { subject: 'Art and Design', credits: 2 },
    { subject: 'Music', credits: 2 },
    { subject: 'Physical Education', credits: 2 },
    { subject: 'French', credits: 3 },
    { subject: 'Arabic', credits: 3 }
  ];

  useEffect(() => {
    if (user) {
      fetchTranscripts();
      fetchStudentSubjects();
      fetchApplications();
    }
  }, [user]);

  const fetchTranscripts = async () => {
    try {
      const transcriptsData = await studentAPI.getTranscripts(user.id);
      setTranscripts(Array.isArray(transcriptsData) ? transcriptsData : []);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      setTranscripts([]);
    }
  };

  const fetchStudentSubjects = async () => {
    try {
      const subjectsData = await studentAPI.getStudentSubjects(user.id);
      if (Array.isArray(subjectsData) && subjectsData.length > 0) {
        setSelectedSubjects(subjectsData);
        setAvailableSubjects(lesothoSubjects.filter(subject => 
          !subjectsData.find(s => s.subject === subject.subject)
        ));
      } else {
        setAvailableSubjects(lesothoSubjects);
      }
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      setAvailableSubjects(lesothoSubjects);
    }
  };

  const fetchQualifiedCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await studentAPI.getQualifiedCourses(user.id);
      setQualifiedCourses(Array.isArray(coursesData) ? coursesData : []);
      setMessage('Found ' + coursesData.length + ' qualified courses');
    } catch (error) {
      console.error('Error fetching qualified courses:', error);
      setQualifiedCourses([]);
      setMessage('Error fetching qualified courses');
    } finally {
      setLoading(false);
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
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
          setActiveTab('subjects');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading transcript:', error);
      setMessage('Error uploading transcript: ' + error.message);
      setUploading(false);
    }
  };

  const handleDeleteTranscript = async (transcriptId) => {
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

  const handleViewTranscript = (transcriptId) => {
    window.open('/api/student/transcript-file/' + transcriptId, '_blank');
  };

  const handleAddSubject = (subject) => {
    const newSubject = {
      subject: subject.subject,
      grade: 'C',
      credits: subject.credits
    };
    
    setSelectedSubjects([...selectedSubjects, newSubject]);
    setAvailableSubjects(availableSubjects.filter(s => s.subject !== subject.subject));
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subject !== subjectToRemove.subject));
    setAvailableSubjects([...availableSubjects, { 
      subject: subjectToRemove.subject, 
      credits: subjectToRemove.credits 
    }]);
  };

  const handleGradeChange = (subjectName, newGrade) => {
    setSelectedSubjects(selectedSubjects.map(subject => 
      subject.subject === subjectName ? { ...subject, grade: newGrade } : subject
    ));
  };

  const handleSaveSubjects = async () => {
    if (selectedSubjects.length === 0) {
      setMessage('Please select at least one subject');
      return;
    }

    try {
      await studentAPI.saveStudentSubjects(user.id, selectedSubjects);
      setMessage('Subjects saved successfully');
      setActiveTab('courses');
      await fetchQualifiedCourses();
    } catch (error) {
      console.error('Error saving subjects:', error);
      setMessage('Error saving subjects: ' + error.message);
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
        personalStatement: personalStatement,
        selectedSubjects: selectedSubjects
      });

      await fetchApplications();
      setPersonalStatement('');
      setSelectedCourse(null);
      setMessage('Course application submitted successfully');
      setActiveTab('applications');
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

    return React.createElement('span', { className: 'status-badge ' + statusClass }, status);
  };

  const getMatchScoreBadge = (score) => {
    let colorClass = 'match-low';
    if (score >= 80) colorClass = 'match-high';
    else if (score >= 60) colorClass = 'match-medium';
    
    return React.createElement('span', { className: 'match-badge ' + colorClass }, score + '% Match');
  };

  const totalCredits = selectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);

  return React.createElement('div', { className: 'undergraduate-portal' },
    React.createElement('div', { className: 'portal-header' },
      React.createElement('h1', null, 'Undergraduate Application Portal'),
      React.createElement('p', null, 'Complete your application in 3 simple steps')
    ),

    message && React.createElement('div', { 
      className: 'message ' + (message.includes('Error') || message.includes('Failed') ? 'error' : 'success') 
    }, message),

    React.createElement('div', { className: 'application-steps' },
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'upload' ? 'active' : '') + ' ' + (transcripts.length > 0 ? 'completed' : ''),
        onClick: function() { setActiveTab('upload'); }
      },
        React.createElement('div', { className: 'step-number' }, '1'),
        React.createElement('div', { className: 'step-label' }, 'Upload Transcript')
      ),
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'subjects' ? 'active' : '') + ' ' + (selectedSubjects.length > 0 ? 'completed' : ''),
        onClick: function() { transcripts.length > 0 && setActiveTab('subjects'); }
      },
        React.createElement('div', { className: 'step-number' }, '2'),
        React.createElement('div', { className: 'step-label' }, 'Select Subjects')
      ),
      React.createElement('div', { 
        className: 'step ' + (activeTab === 'courses' ? 'active' : '') + ' ' + (qualifiedCourses.length > 0 ? 'completed' : ''),
        onClick: function() { selectedSubjects.length > 0 && setActiveTab('courses'); }
      },
        React.createElement('div', { className: 'step-number' }, '3'),
        React.createElement('div', { className: 'step-label' }, 'Apply to Courses')
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
                React.createElement('p', null, 'Click to upload your high school transcript in PDF format'),
                React.createElement('p', { className: 'upload-note' }, 'Maximum file size: 10MB')
              )
          )
        ),

        transcripts.length > 0 && React.createElement('div', { className: 'transcripts-list' },
          React.createElement('h3', null, 'Your Transcripts'),
          transcripts.map(function(transcript) {
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

        transcripts.length > 0 && React.createElement('div', { className: 'step-actions' },
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: function() { setActiveTab('subjects'); }
          }, 'Continue to Step 2: Select Subjects')
        )
      ),

      activeTab === 'subjects' && React.createElement('div', { className: 'subjects-section' },
        React.createElement('h2', null, 'Select Your Subjects and Grades'),
        React.createElement('p', { className: 'section-description' }, 
          'Select all the subjects you completed in high school and enter your grades. This will be used to determine which courses you qualify for.'
        ),

        React.createElement('div', { className: 'subjects-container' },
          React.createElement('div', { className: 'selected-subjects' },
            React.createElement('h3', null, 'Selected Subjects (' + selectedSubjects.length + ')'),
            React.createElement('div', { className: 'credits-summary' },
              'Total Credits: ' + totalCredits
            ),
            selectedSubjects.length === 0 ? 
              React.createElement('p', { className: 'no-subjects' }, 'No subjects selected yet') :
              React.createElement('div', { className: 'selected-subjects-list' },
                selectedSubjects.map(function(subject) {
                  return React.createElement('div', { key: subject.subject, className: 'subject-item selected' },
                    React.createElement('div', { className: 'subject-info' },
                      React.createElement('span', { className: 'subject-name' }, subject.subject),
                      React.createElement('span', { className: 'subject-credits' }, subject.credits + ' credits')
                    ),
                    React.createElement('div', { className: 'subject-controls' },
                      React.createElement('select', {
                        value: subject.grade,
                        onChange: function(e) { handleGradeChange(subject.subject, e.target.value); },
                        className: 'grade-select'
                      },
                        ['A*', 'A', 'B', 'C', 'D', 'E'].map(function(grade) {
                          return React.createElement('option', { key: grade, value: grade }, grade);
                        })
                      ),
                      React.createElement('button', {
                        className: 'btn btn-danger btn-sm',
                        onClick: function() { handleRemoveSubject(subject); }
                      }, 'Remove')
                    )
                  );
                })
              )
          ),

          React.createElement('div', { className: 'available-subjects' },
            React.createElement('h3', null, 'Available Subjects'),
            availableSubjects.length === 0 ? 
              React.createElement('p', { className: 'no-subjects' }, 'All subjects selected') :
              React.createElement('div', { className: 'available-subjects-list' },
                availableSubjects.map(function(subject) {
                  return React.createElement('div', { 
                    key: subject.subject, 
                    className: 'subject-item available',
                    onClick: function() { handleAddSubject(subject); }
                  },
                    React.createElement('span', { className: 'subject-name' }, subject.subject),
                    React.createElement('span', { className: 'subject-credits' }, subject.credits + ' credits')
                  );
                })
              )
          )
        ),

        React.createElement('div', { className: 'step-actions' },
          React.createElement('button', {
            className: 'btn btn-secondary',
            onClick: function() { setActiveTab('upload'); }
          }, 'Back to Transcripts'),
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: handleSaveSubjects,
            disabled: selectedSubjects.length === 0
          }, 'Save Subjects and Find Courses')
        )
      ),

      activeTab === 'courses' && React.createElement('div', { className: 'courses-section' },
        React.createElement('h2', null, 'Courses You Qualify For'),
        React.createElement('p', { className: 'section-description' }, 
          'Based on your selected subjects and grades, you qualify for ' + qualifiedCourses.length + ' courses.'
        ),

        loading ? 
          React.createElement('div', { className: 'loading' }, 'Finding qualified courses...') :
          qualifiedCourses.length === 0 ?
            React.createElement('div', { className: 'no-courses' },
              React.createElement('h3', null, 'No Qualified Courses Found'),
              React.createElement('p', null, 
                'No courses match your current subject selection. You may need to adjust your subjects or grades.'
              ),
              React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: function() { setActiveTab('subjects'); }
              }, 'Back to Subjects')
            ) :
            React.createElement('div', null,
              React.createElement('div', { className: 'courses-grid' },
                qualifiedCourses.map(function(course) {
                  return React.createElement('div', { key: course.id, className: 'course-card qualified' },
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
                        React.createElement('span', { className: 'value' }, 'M' + course.fees + '/year')
                      )
                    ),
                    React.createElement('div', { className: 'course-requirements' },
                      React.createElement('h4', null, 'Requirements'),
                      React.createElement('p', null, 
                        'Minimum Grade: ' + course.requirements.minGrade,
                        React.createElement('br', null),
                        'Required Subjects: ' + course.requirements.requiredSubjects.join(', ')
                      )
                    ),
                    React.createElement('button', {
                      className: 'btn btn-primary',
                      onClick: function() {
                        setSelectedCourse(course);
                        setActiveTab('apply');
                      }
                    }, 'Apply Now')
                  );
                })
              )
            )
      ),

      activeTab === 'apply' && selectedCourse && React.createElement('div', { className: 'apply-section' },
        React.createElement('h2', null, 'Apply for Course'),
        React.createElement('div', { className: 'apply-form' },
          React.createElement('div', { className: 'selected-course' },
            React.createElement('h3', null, selectedCourse.name),
            React.createElement('p', { className: 'institution' }, selectedCourse.institutionName),
            React.createElement('p', { className: 'faculty' }, selectedCourse.faculty),
            React.createElement('p', { className: 'match-score' }, 
              'Your qualification match: ' + selectedCourse.matchScore + '%'
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Personal Statement'),
            React.createElement('textarea', {
              value: personalStatement,
              onChange: function(e) { setPersonalStatement(e.target.value); },
              placeholder: 'Explain why you are interested in this course and why you would be a good candidate...',
              rows: 8,
              required: true
            }),
            React.createElement('div', { className: 'character-count' },
              personalStatement.length + ' characters (minimum 100 required)'
            )
          ),
          React.createElement('div', { className: 'form-actions' },
            React.createElement('button', {
              className: 'btn btn-secondary',
              onClick: function() { setActiveTab('courses'); }
            }, 'Back to Courses'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: handleApplyCourse,
              disabled: !personalStatement || personalStatement.length < 100
            }, 'Submit Application')
          )
        )
      ),

      activeTab === 'applications' && React.createElement('div', { className: 'applications-section' },
        React.createElement('h2', null, 'My Course Applications'),
        applications.length === 0 ? 
          React.createElement('div', { className: 'no-applications' },
            React.createElement('p', null, 'You have not applied to any courses yet'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: function() { setActiveTab('courses'); }
            }, 'Browse Qualified Courses')
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
                applications.map(function(application) {
                  return React.createElement('tr', { key: application.id },
                    React.createElement('td', null, application.courseName),
                    React.createElement('td', null, application.institutionName),
                    React.createElement('td', null, new Date(application.appliedAt).toLocaleDateString()),
                    React.createElement('td', null, getStatusBadge(application.status)),
                    React.createElement('td', null,
                      React.createElement('button', { className: 'btn btn-secondary btn-sm' }, 'View Details')
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

export default UndergraduatePortal;