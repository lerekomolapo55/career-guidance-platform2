import React, { useState, useEffect } from 'react';
import './CourseApplication.css';
import { studentAPI, generalAPI } from './api';

const CourseApplication = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [qualifiedCourses, setQualifiedCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [personalStatement, setPersonalStatement] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcriptAnalysis, setTranscriptAnalysis] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchApplications();
      fetchTranscripts();
    }
  }, [user]);

  useEffect(() => {
    if (transcripts.length > 0) {
      fetchQualifiedCourses();
    } else {
      setQualifiedCourses([]);
      setTranscriptAnalysis(null);
    }
  }, [transcripts]);

  const fetchCourses = async () => {
    try {
      const coursesData = await generalAPI.getCourses();
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchQualifiedCourses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getQualifiedCourses(user.id);
      
      if (response.qualifiedCourses) {
        setQualifiedCourses(Array.isArray(response.qualifiedCourses) ? response.qualifiedCourses : []);
        setTranscriptAnalysis(response.transcriptAnalysis || null);
      } else {
        setQualifiedCourses([]);
        setTranscriptAnalysis(null);
      }
    } catch (error) {
      console.error('Error fetching qualified courses:', error);
      setQualifiedCourses([]);
      setTranscriptAnalysis(null);
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

  const fetchTranscripts = async () => {
    try {
      const transcriptsData = await studentAPI.getTranscripts(user.id);
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
      setMessage('');
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = event.target.result;
          
          await studentAPI.uploadTranscript({
            studentId: user.id,
            studentType: user.studentType,
            fileName: file.name,
            fileData: fileData
          });

          await fetchTranscripts();
          setMessage('Transcript uploaded and analyzed successfully!');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading transcript:', error);
        setMessage('Upload failed: ' + error.message);
      } finally {
        setUploading(false);
      }
    } else {
      setMessage('Please upload only PDF files');
    }
  };

  const handleApply = async () => {
    if (!selectedCourse || !personalStatement) {
      setMessage('Please select a course and provide a personal statement.');
      return;
    }

    try {
      const course = courses.find(c => c.id === selectedCourse) || qualifiedCourses.find(c => c.id === selectedCourse);
      if (!course) {
        setMessage('Selected course not found.');
        return;
      }

      await studentAPI.applyCourse({
        studentId: user.id,
        courseId: selectedCourse,
        institutionId: course.institutionId,
        personalStatement: personalStatement
      });

      await fetchApplications();
      setPersonalStatement('');
      setSelectedCourse('');
      setMessage('Application submitted successfully!');
    } catch (error) {
      setMessage('Failed to submit application: ' + error.message);
    }
  };

  const handleDeleteTranscript = async (transcriptId) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        await studentAPI.deleteTranscript(transcriptId);
        const updatedTranscripts = transcripts.filter(t => t.id !== transcriptId);
        setTranscripts(updatedTranscripts);
        setMessage('Transcript deleted successfully!');
      } catch (error) {
        console.error('Error deleting transcript:', error);
        setMessage('Failed to delete transcript');
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

  const getMatchScoreBadge = (score) => {
    let colorClass = 'match-low';
    if (score >= 80) colorClass = 'match-high';
    else if (score >= 60) colorClass = 'match-medium';
    
    return <span className={`match-badge ${colorClass}`}>{score}% Match</span>;
  };

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeQualifiedCourses = Array.isArray(qualifiedCourses) ? qualifiedCourses : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeTranscripts = Array.isArray(transcripts) ? transcripts : [];

  return (
    <div className="course-application">
      <div className="application-header">
        <h1>Course Applications</h1>
        <p>Apply for courses at higher learning institutions in Lesotho</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="application-tabs">
        <button 
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse All Courses
        </button>
        <button 
          className={`tab-button ${activeTab === 'qualified' ? 'active' : ''}`}
          onClick={() => setActiveTab('qualified')}
        >
          Qualified Courses {safeQualifiedCourses.length > 0 && `(${safeQualifiedCourses.length})`}
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
          <div className="browse-courses">
            <h2>All Available Courses</h2>
            <div className="courses-grid">
              {safeCourses.length === 0 ? (
                <div className="no-courses">
                  <p>No courses available at the moment.</p>
                </div>
              ) : (
                safeCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <h3>{course.name}</h3>
                      <span className="institution">{course.institutionName}</span>
                    </div>
                    <div className="course-details">
                      <div className="detail-item">
                        <span className="label">Faculty:</span>
                        <span className="value">{course.faculty}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        <span className="value">{course.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Fees:</span>
                        <span className="value">M{course.fees}/year</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Credits:</span>
                        <span className="value">{course.credits}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Level:</span>
                        <span className="value">{course.level}</span>
                      </div>
                    </div>
                    <div className="course-requirements">
                      <h4>Requirements:</h4>
                      <p>{course.requirements}</p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedCourse(course.id);
                        setActiveTab('apply');
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'qualified' && (
          <div className="qualified-courses">
            <h2>Courses You Qualify For</h2>
            
            {loading ? (
              <div className="loading">Analyzing your transcripts...</div>
            ) : safeTranscripts.length === 0 ? (
              <div className="no-transcripts-message">
                <h3>No Transcripts Found</h3>
                <p>Upload your academic transcripts to see courses you qualify for.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('transcripts')}
                >
                  Upload Transcripts
                </button>
              </div>
            ) : safeQualifiedCourses.length === 0 ? (
              <div className="no-qualified-courses">
                <h3>No Qualified Courses Found</h3>
                <p>Based on your transcript analysis, you don't currently qualify for any courses.</p>
                {transcriptAnalysis && (
                  <div className="transcript-analysis">
                    <h4>Your Transcript Analysis:</h4>
                    <div className="analysis-details">
                      <p><strong>Education Level:</strong> {transcriptAnalysis.level}</p>
                      <p><strong>Estimated GPA:</strong> {transcriptAnalysis.gpa}</p>
                      <p><strong>Subjects Found:</strong> {transcriptAnalysis.subjects.join(', ')}</p>
                    </div>
                  </div>
                )}
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('browse')}
                >
                  Browse All Courses
                </button>
              </div>
            ) : (
              <div className="qualified-courses-list">
                {transcriptAnalysis && (
                  <div className="transcript-analysis-summary">
                    <h4>Based on your transcript analysis:</h4>
                    <div className="analysis-grid">
                      <div className="analysis-item">
                        <span className="label">Education Level:</span>
                        <span className="value">{transcriptAnalysis.level}</span>
                      </div>
                      <div className="analysis-item">
                        <span className="label">Estimated GPA:</span>
                        <span className="value">{transcriptAnalysis.gpa}</span>
                      </div>
                      <div className="analysis-item">
                        <span className="label">Subjects:</span>
                        <span className="value">{transcriptAnalysis.subjects.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="courses-grid">
                  {safeQualifiedCourses.map(course => (
                    <div key={course.id} className="course-card qualified">
                      <div className="course-header">
                        <h3>{course.name}</h3>
                        <div className="course-meta">
                          <span className="institution">{course.institutionName}</span>
                          {getMatchScoreBadge(course.matchScore || 0)}
                        </div>
                      </div>
                      <div className="course-details">
                        <div className="detail-item">
                          <span className="label">Faculty:</span>
                          <span className="value">{course.faculty}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Duration:</span>
                          <span className="value">{course.duration}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Fees:</span>
                          <span className="value">M{course.fees}/year</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Level:</span>
                          <span className="value">{course.level}</span>
                        </div>
                      </div>
                      <div className="course-requirements">
                        <h4>Requirements:</h4>
                        <p>{course.requirements}</p>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedCourse(course.id);
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
          </div>
        )}

        {activeTab === 'apply' && (
          <div className="apply-section">
            <h2>Apply for Course</h2>
            <div className="apply-form">
              {safeTranscripts.length === 0 && (
                <div className="warning-message">
                  <h3>Transcripts Required</h3>
                  <p>You need to upload your transcripts before applying for courses.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('transcripts')}
                  >
                    Upload Transcripts
                  </button>
                </div>
              )}

              {safeTranscripts.length > 0 && (
                <>
                  <div className="form-group">
                    <label>Select Course to Apply For</label>
                    <div className="courses-selection">
                      {safeCourses.map(course => (
                        <div 
                          key={course.id} 
                          className={`course-option ${selectedCourse === course.id ? 'selected' : ''}`}
                          onClick={() => setSelectedCourse(course.id)}
                        >
                          <div className="course-option-header">
                            <h4>{course.name}</h4>
                            <span className="institution">{course.institutionName}</span>
                          </div>
                          <div className="course-option-details">
                            <span>Faculty: {course.faculty}</span>
                            <span>Duration: {course.duration}</span>
                            <span>Fees: M{course.fees}/year</span>
                            <span>Level: {course.level}</span>
                          </div>
                          <div className="course-option-requirements">
                            <strong>Requirements:</strong> {course.requirements}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCourse && (
                    <div className="form-group">
                      <label>Personal Statement</label>
                      <textarea
                        value={personalStatement}
                        onChange={(e) => setPersonalStatement(e.target.value)}
                        placeholder="Explain why you are interested in this course and why you would be a good candidate..."
                        rows="6"
                        required
                      />
                      <div className="character-count">
                        {personalStatement.length} characters (minimum 50 required)
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setActiveTab('qualified')}
                    >
                      View Qualified Courses
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleApply}
                      disabled={!selectedCourse || !personalStatement || personalStatement.length < 50}
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
            
            {safeTranscripts.length > 0 && transcriptAnalysis && (
              <div className="transcript-analysis-preview">
                <h3>Transcript Analysis</h3>
                <div className="analysis-cards">
                  <div className="analysis-card">
                    <h4>Education Level</h4>
                    <p>{transcriptAnalysis.level}</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Estimated GPA</h4>
                    <p>{transcriptAnalysis.gpa}</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Subjects</h4>
                    <p>{transcriptAnalysis.subjects.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="transcripts-list">
              {safeTranscripts.length > 0 ? (
                safeTranscripts.map(transcript => (
                  <div key={transcript.id} className="transcript-item">
                    <div className="transcript-info">
                      <h4>{transcript.fileName}</h4>
                      <p>Uploaded: {new Date(transcript.uploadedAt).toLocaleDateString()}</p>
                      {getStatusBadge(transcript.status)}
                      {transcript.analysis && (
                        <div className="transcript-analysis-brief">
                          <span>Level: {transcript.analysis.level}</span>
                          <span>GPA: {transcript.analysis.gpa}</span>
                        </div>
                      )}
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
              <p>Upload your academic transcript in PDF format for course qualification analysis.</p>
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
                {uploading ? 'Uploading and Analyzing...' : 'Upload Transcript'}
              </button>
              {uploading && (
                <div className="upload-progress">
                  <p>Analyzing your transcript for course qualifications...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>My Applications</h2>
            <div className="applications-list">
              {safeApplications.length === 0 ? (
                <div className="no-applications">
                  <p>You haven't applied to any courses yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('browse')}
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Institution</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeApplications.map(application => (
                        <tr key={application.id}>
                          <td>{application.courseName}</td>
                          <td>{application.institutionName}</td>
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

export default CourseApplication;