import React, { useState, useEffect } from 'react';
import { studentAPI } from './api';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    if (userData && userData.userType === 'student') {
      loadTranscripts(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadTranscripts = async (studentId) => {
    try {
      const data = await studentAPI.getTranscripts(studentId);
      setTranscripts(data);
    } catch (error) {
      console.error('Error loading transcripts:', error);
      setMessage('Error loading transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      setMessage('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;
          
          await studentAPI.uploadTranscript({
            studentId: user.id,
            studentType: user.studentType,
            fileName: file.name,
            fileData: fileData
          });

          setMessage('Transcript uploaded successfully');
          await loadTranscripts(user.id);
          event.target.value = '';
        } catch (error) {
          console.error('Upload error:', error);
          setMessage('Error uploading transcript: ' + error.message);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      setMessage('Error reading file');
      setUploading(false);
    }
  };

  const handleDeleteTranscript = async (transcriptId) => {
    if (!window.confirm('Are you sure you want to delete this transcript?')) {
      return;
    }

    try {
      await studentAPI.deleteTranscript(transcriptId);
      setMessage('Transcript deleted successfully');
      await loadTranscripts(user.id);
    } catch (error) {
      console.error('Error deleting transcript:', error);
      setMessage('Error deleting transcript');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return <div className="profile-error">Please log in to view your profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Student Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Student Type:</label>
              <span>{user.studentType}</span>
            </div>
            <div className="info-item">
              <label>User Type:</label>
              <span>{user.userType}</span>
            </div>
          </div>
        </div>

        {user.userType === 'student' && (
          <div className="transcripts-section">
            <h2>Academic Transcripts</h2>
            
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="upload-section">
              <label htmlFor="transcript-upload" className="upload-label">
                Upload Transcript (PDF only, max 5MB)
              </label>
              <input
                id="transcript-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="file-input"
              />
              {uploading && <div className="uploading">Uploading...</div>}
            </div>

            <div className="transcripts-list">
              {transcripts.length === 0 ? (
                <div className="no-transcripts">
                  No transcripts uploaded yet. Upload your academic transcripts to apply for courses.
                </div>
              ) : (
                transcripts.map((transcript) => (
                  <div key={transcript.id} className="transcript-item">
                    <div className="transcript-info">
                      <h4>{transcript.fileName}</h4>
                      <p>Uploaded: {formatDate(transcript.uploadedAt)}</p>
                      <p>Status: <span className={`status ${transcript.status}`}>{transcript.status}</span></p>
                    </div>
                    <div className="transcript-actions">
                      <a
                        href={transcript.fileData}
                        download={transcript.fileName}
                        className="download-btn"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDeleteTranscript(transcript.id)}
                        className="delete-btn"
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
      </div>
    </div>
  );
};

export default Profile;