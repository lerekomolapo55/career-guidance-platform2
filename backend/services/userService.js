const userService = {
  // Find user by ID
  findUserById: (data, userId) => {
    return data.users.find(user => user.id === userId);
  },

  // Find user by email
  findUserByEmail: (data, email) => {
    return data.users.find(user => user.email === email);
  },

  // Get all users by type
  getUsersByType: (data, userType) => {
    return data.users.filter(user => user.userType === userType);
  },

  // Update user profile
  updateUserProfile: (data, userId, updates) => {
    const userIndex = data.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return null;
    }

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return data.users[userIndex];
  },

  // Get user statistics
  getUserStats: (data, userId) => {
    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return null;
    }

    let stats = {};

    if (user.userType === 'student') {
      const applications = data.applications.filter(app => app.studentId === userId);
      const transcripts = data.transcripts.filter(t => t.studentId === userId);
      
      stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        admittedApplications: applications.filter(app => app.status === 'admitted').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
        totalTranscripts: transcripts.length
      };
    } else if (user.userType === 'company') {
      const jobs = data.jobs.filter(job => job.companyId === userId);
      const applications = data.applications.filter(app => 
        jobs.some(job => job.id === app.jobId)
      );
      
      stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length
      };
    } else if (user.userType === 'institution') {
      const courses = data.courses.filter(course => course.institutionId === userId);
      const applications = data.applications.filter(app => 
        courses.some(course => course.id === app.courseId)
      );
      
      stats = {
        totalCourses: courses.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        admittedStudents: applications.filter(app => app.status === 'admitted').length
      };
    }

    return stats;
  },

  // Check if user can apply for course
  canApplyForCourse: (data, studentId, courseId, institutionId) => {
    // Check if already applied to 2 courses at this institution
    const existingApplications = data.applications.filter(
      app => app.studentId === studentId && app.institutionId === institutionId
    );

    if (existingApplications.length >= 2) {
      return { canApply: false, reason: 'Maximum of 2 applications per institution allowed' };
    }

    // Check if already applied to this course
    const alreadyApplied = data.applications.find(
      app => app.studentId === studentId && app.courseId === courseId
    );

    if (alreadyApplied) {
      return { canApply: false, reason: 'Already applied to this course' };
    }

    return { canApply: true };
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check if user is approved
  isUserApproved: (data, userId) => {
    const user = data.users.find(u => u.id === userId);
    return user ? (user.isApproved !== false) : false;
  }
};

module.exports = userService;