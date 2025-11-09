import React, { useState, useEffect } from 'react';
import { api } from './api';
import './Universities.css';

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchUniversities();
    fetchAllCourses();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await api.get('/universities');
      setUniversities(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const data = await api.get('/courses');
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const getUniversityCourses = (universityName) => {
    return courses.filter(course => course.institutionName === universityName);
  };

  const handleViewCourses = (university) => {
    setSelectedUniversity(university);
  };

  const handleBackToList = () => {
    setSelectedUniversity(null);
  };

  const handleApplyCourse = async (course) => {
    if (!user) {
      alert('Please login to apply for courses');
      window.location.href = '/auth';
      return;
    }

    if (user.userType !== 'student') {
      alert('Only students can apply for courses');
      return;
    }

    try {
      const transcripts = await api.get(`/student/transcripts/${user.id}`);
      if (!transcripts || transcripts.length === 0) {
        alert('Please upload your transcripts before applying for courses');
        window.location.href = '/profile';
        return;
      }
    } catch (error) {
      alert('Please upload your transcripts before applying for courses');
      window.location.href = '/profile';
      return;
    }

    const personalStatement = prompt('Please provide a personal statement for your application:');
    
    if (!personalStatement) {
      alert('Personal statement is required');
      return;
    }

    if (personalStatement.length < 10) {
      alert('Personal statement must be at least 10 characters long');
      return;
    }

    try {
      await api.post('/student/apply-course', {
        studentId: user.id,
        courseId: course.id,
        institutionId: course.institutionId,
        personalStatement: personalStatement
      });
      
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Error submitting application: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="universities-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading universities...</p>
        </div>
      </div>
    );
  }

  if (selectedUniversity) {
    const universityCourses = getUniversityCourses(selectedUniversity.name);
    
    return (
      <div className="universities-page">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={handleBackToList}>
            Back to Universities
          </button>
          <h1>{selectedUniversity.name} - Courses</h1>
          <p>{universityCourses.length} courses available</p>
        </div>

        <div className="courses-list">
          {universityCourses.length > 0 ? (
            universityCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.name}</h3>
                  <span className="course-level">{course.level}</span>
                </div>
                <div className="course-details">
                  <p><strong>Faculty:</strong> {course.faculty}</p>
                  <p><strong>Credits:</strong> {course.credits}</p>
                  <p><strong>Fees:</strong> M{course.fees}</p>
                  <p><strong>Duration:</strong> {course.duration}</p>
                  <p><strong>Requirements:</strong> {course.requirements}</p>
                  {course.description && (
                    <p><strong>Description:</strong> {course.description}</p>
                  )}
                </div>
                <div className="course-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApplyCourse(course)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses">
              <p>No courses available for {selectedUniversity.name} at the moment.</p>
              <p>Please check back later or contact the institution directly.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="universities-page">
      <div className="page-header">
        <h1>Universities in Lesotho</h1>
        <p>Explore higher education institutions and their course offerings</p>
      </div>

      <div className="universities-grid">
        {universities.map(university => {
          const universityCourses = getUniversityCourses(university.name);
          return (
            <div key={university.id} className="university-card">
              <div className="university-header">
                <h3>{university.name}</h3>
                <span className="university-type">{university.type}</span>
              </div>
              <div className="university-details">
                <p><strong>Location:</strong> {university.location}</p>
                <p><strong>Established:</strong> {university.established}</p>
                <p><strong>Courses Available:</strong> {universityCourses.length}</p>
                {university.description && (
                  <p className="university-description">{university.description}</p>
                )}
              </div>
              <div className="university-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleViewCourses(university)}
                >
                  View Courses ({universityCourses.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {universities.length === 0 && (
        <div className="no-universities">
          <p>No universities found. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default Universities;