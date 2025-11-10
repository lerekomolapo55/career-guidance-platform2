const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://career-guidance-platform2.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const api = {
  fetch: async (url, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },

  get: (url) => api.fetch(url),

  post: (url, data) => api.fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  put: (url, data) => api.fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (url) => api.fetch(url, {
    method: 'DELETE',
  }),
};

// Export the base api object for direct use
export { api };

// Student API methods
export const studentAPI = {
  uploadTranscript: (transcriptData) => api.post('/student/upload-transcript', transcriptData),
  
  getTranscripts: (studentId) => api.get(`/student/transcripts/${studentId}`),
  
  deleteTranscript: (transcriptId) => api.delete(`/student/transcripts/${transcriptId}`),
  
  applyCourse: (applicationData) => api.post('/student/apply-course', applicationData),
  
  getApplications: (studentId) => api.get(`/student/applications/${studentId}`),
  
  getQualifiedCourses: (studentId) => api.get(`/student/qualified-courses/${studentId}`)
};

// Company API methods
export const companyAPI = {
  postJob: (jobData) => api.post('/company/jobs', jobData),
  
  getCompanyJobs: (companyId) => api.get(`/company/jobs/${companyId}`),
  
  getCompanyApplications: (companyId) => api.get(`/company/applications/${companyId}`),
  
  updateApplication: (applicationId, updates) => api.put(`/company/applications/${applicationId}`, updates),
  
  getCompanyProfile: (companyId) => api.get(`/company/profile/${companyId}`),
  
  updateCompanyProfile: (companyId, profileData) => api.put(`/company/profile/${companyId}`, profileData),
  
  updateJob: (jobId, updates) => api.put(`/company/jobs/${jobId}`, updates),
  
  deleteJob: (jobId) => api.delete(`/company/jobs/${jobId}`)
};

// Institution API methods
export const institutionAPI = {
  getCourses: (institutionId) => api.get(`/institution/courses/${institutionId}`),
  
  addCourse: (courseData) => api.post('/institution/courses', courseData),
  
  updateCourse: (courseId, updates) => api.put(`/institution/courses/${courseId}`, updates),
  
  deleteCourse: (courseId) => api.delete(`/institution/courses/${courseId}`),
  
  getApplications: (institutionId) => api.get(`/institution/applications/${institutionId}`),
  
  updateApplication: (applicationId, updates) => api.put(`/institution/applications/${applicationId}`, updates)
};

// Graduate/Job API methods
export const graduateAPI = {
  getJobs: () => api.get('/jobs'),
  
  getGraduateJobs: () => api.get('/graduate/jobs'),
  
  getQualifiedJobs: (studentId) => api.get(`/graduate/qualified-jobs/${studentId}`),
  
  applyJob: (applicationData) => api.post('/graduate/apply-job', applicationData),
  
  getApplications: (studentId) => api.get(`/graduate/applications/${studentId}`)
};

// Job API methods (public)
export const jobAPI = {
  getJobs: () => api.get('/jobs'),
  
  getJob: (jobId) => api.get(`/jobs/${jobId}`)
};

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  
  registerStudent: (studentData) => api.post('/auth/register/student', studentData),
  
  registerCompany: (companyData) => api.post('/auth/register/company', companyData),
  
  registerInstitution: (institutionData) => api.post('/auth/register/institution', institutionData),
  
  registerAdmin: (adminData) => api.post('/auth/register/admin', adminData)
};

// Admin API methods
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getInstitutions: () => api.get('/admin/institutions'),
  
  getCompanies: () => api.get('/admin/companies'),
  
  getUsers: () => api.get('/admin/users'),
  
  getPendingApprovals: () => api.get('/admin/pending-approvals'),
  
  approveCompany: (companyId) => api.put(`/admin/companies/${companyId}/approve`),
  
  suspendCompany: (companyId) => api.put(`/admin/companies/${companyId}/suspend`),
  
  approveInstitution: (institutionId) => api.put(`/admin/institutions/${institutionId}/approve`),
  
  suspendInstitution: (institutionId) => api.put(`/admin/institutions/${institutionId}/suspend`),
  
  deleteCompany: (companyId) => api.delete(`/admin/companies/${companyId}`),
  
  deleteInstitution: (institutionId) => api.delete(`/admin/institutions/${institutionId}`),
  
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`)
};

// General API methods
export const generalAPI = {
  getUniversities: () => api.get('/universities'),
  
  getCourses: () => api.get('/courses'),
  
  getUndergraduateCourses: () => api.get('/undergraduate/courses'),
  
  getCompanies: () => api.get('/companies'),
  
  getJobs: () => api.get('/jobs'),
  
  healthCheck: () => api.get('/health')
};

export default api;