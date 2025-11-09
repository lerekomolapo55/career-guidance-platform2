import React, { useState, useEffect } from 'react';
import { institutionAPI } from './api';
import './InstitutionDashboard.css';

const InstitutionDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newCourse, setNewCourse] = useState({
    name: '',
    faculty: '',
    credits: '',
    fees: '',
    duration: '',
    level: 'undergraduate',
    requirements: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'courses') {
        const coursesData = await institutionAPI.getCourses(user.id);
        setCourses(coursesData);
      } else if (activeTab === 'applications') {
        const applicationsData = await institutionAPI.getApplications(user.id);
        setApplications(applicationsData);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const courseData = {
        ...newCourse,
        institutionId: user.id,
        institutionName: user.institutionName
      };

      const result = await institutionAPI.addCourse(courseData);
      setSuccess(result.message);
      setNewCourse({
        name: '',
        faculty: '',
        credits: '',
        fees: '',
        duration: '',
        level: 'undergraduate',
        requirements: '',
        description: ''
      });
      loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (applicationId, status) => {
    setLoading(true);
    setError('');
    try {
      await institutionAPI.updateApplication(applicationId, { status });
      setSuccess(`Application ${status} successfully`);
      loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await institutionAPI.deleteCourse(courseId);
      setSuccess('Course deleted successfully');
      loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCoursesTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h2>Manage Courses</h2>
        <button 
          className="btn btn-primary"
          onClick={() => document.getElementById('addCourseModal').showModal()}
        >
          Add New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <p>No courses found. Add your first course to get started.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3>{course.name}</h3>
                <span className={`status-badge ${course.status}`}>
                  {course.status}
                </span>
              </div>
              <div className="course-details">
                <p><strong>Faculty:</strong> {course.faculty}</p>
                <p><strong>Credits:</strong> {course.credits}</p>
                <p><strong>Fees:</strong> M{course.fees}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
                <p><strong>Level:</strong> {course.level}</p>
                {course.requirements && (
                  <p><strong>Requirements:</strong> {course.requirements}</p>
                )}
                {course.description && (
                  <p><strong>Description:</strong> {course.description}</p>
                )}
              </div>
              <div className="course-actions">
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <dialog id="addCourseModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Add New Course</h3>
            <button 
              className="close-btn"
              onClick={() => document.getElementById('addCourseModal').close()}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleAddCourse}>
            <div className="form-group">
              <label>Course Name *</label>
              <input
                type="text"
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Faculty *</label>
                <input
                  type="text"
                  value={newCourse.faculty}
                  onChange={(e) => setNewCourse({...newCourse, faculty: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Level *</label>
                <select
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                  required
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Credits *</label>
                <input
                  type="number"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fees (M) *</label>
                <input
                  type="number"
                  value={newCourse.fees}
                  onChange={(e) => setNewCourse({...newCourse, fees: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Duration *</label>
              <input
                type="text"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                placeholder="e.g., 4 years"
                required
              />
            </div>
            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={newCourse.requirements}
                onChange={(e) => setNewCourse({...newCourse, requirements: e.target.value})}
                rows="3"
                placeholder="Course prerequisites and requirements"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                rows="3"
                placeholder="Course description"
              />
            </div>
            <div className="modal-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => document.getElementById('addCourseModal').close()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Course'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h2>Student Applications</h2>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <p>No applications found.</p>
        </div>
      ) : (
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application.id}>
                  <td>{application.studentName}</td>
                  <td>{application.studentEmail}</td>
                  <td>{application.courseName}</td>
                  <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${application.status}`}>
                      {application.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {application.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-small"
                            onClick={() => handleUpdateApplication(application.id, 'approved')}
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-small"
                            onClick={() => handleUpdateApplication(application.id, 'rejected')}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="institution-dashboard">
      <div className="dashboard-header">
        <h1>Institution Dashboard</h1>
        <p>Welcome, {user.institutionName}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'courses' && renderCoursesTab()}
      {activeTab === 'applications' && renderApplicationsTab()}
    </div>
  );
};

export default InstitutionDashboard;