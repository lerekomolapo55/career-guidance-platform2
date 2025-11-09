const express = require('express');
const router = express.Router();

// Get student dashboard data
router.get('/dashboard/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const data = req.storage.readData();

    const studentApplications = data.applications.filter(app => app.studentId === studentId);
    const studentTranscripts = data.transcripts.filter(transcript => transcript.studentId === studentId);

    const stats = {
      totalApplications: studentApplications.length,
      pendingApplications: studentApplications.filter(app => app.status === 'pending').length,
      approvedApplications: studentApplications.filter(app => app.status === 'approved').length,
      rejectedApplications: studentApplications.filter(app => app.status === 'rejected').length,
      waitlistedApplications: studentApplications.filter(app => app.status === 'waiting').length,
      totalTranscripts: studentTranscripts.length
    };

    // Enrich applications with course and institution details
    const enrichedApplications = studentApplications.map(app => {
      const course = data.courses.find(c => c.id === app.courseId);
      const institution = data.institutions.find(inst => inst.id === app.institutionId);
      
      return {
        ...app,
        courseName: course ? course.name : 'Unknown Course',
        institutionName: institution ? institution.name : 'Unknown Institution'
      };
    });

    res.json({
      stats,
      applications: enrichedApplications,
      transcripts: studentTranscripts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student dashboard' });
  }
});

// Get courses student qualifies for based on transcripts
router.get('/qualified-courses/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const data = req.storage.readData();

    // Get student's transcripts and profile
    const student = data.users.find(u => u.id === studentId);
    const studentTranscripts = data.transcripts.filter(t => t.studentId === studentId);
    
    // Simple qualification logic - in real app, analyze transcript content
    const hasTranscripts = studentTranscripts.length > 0;
    const isGraduate = student?.studentType === 'graduate';

    const qualifiedCourses = data.courses.filter(course => {
      if (!hasTranscripts) return false;
      
      // High school students qualify for undergraduate courses
      // Graduates qualify for postgraduate courses
      if (isGraduate) {
        return course.level === 'postgraduate';
      } else {
        return course.level === 'undergraduate';
      }
    });

    // Enrich with institution details
    const enrichedCourses = qualifiedCourses.map(course => {
      const institution = data.institutions.find(inst => inst.id === course.institutionId);
      return {
        ...course,
        institutionName: institution ? institution.name : 'Unknown Institution',
        institutionLocation: institution ? institution.location : 'Unknown Location'
      };
    });

    res.json(enrichedCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching qualified courses' });
  }
});

// Apply for course with validation
router.post('/apply-course', (req, res) => {
  try {
    const { studentId, courseId, institutionId, personalStatement } = req.body;
    const data = req.storage.readData();

    // Check if student has transcripts
    const studentTranscripts = data.transcripts.filter(t => t.studentId === studentId);
    if (studentTranscripts.length === 0) {
      return res.status(400).json({ 
        message: 'Please upload your transcripts before applying for courses' 
      });
    }

    // Check if already applied to 2 courses at this institution
    const existingApplications = data.applications.filter(
      app => app.studentId === studentId && app.institutionId === institutionId
    );

    if (existingApplications.length >= 2) {
      return res.status(400).json({ 
        message: 'Maximum of 2 applications per institution allowed' 
      });
    }

    // Check if already applied to this course
    const alreadyApplied = data.applications.find(
      app => app.studentId === studentId && app.courseId === courseId
    );

    if (alreadyApplied) {
      return res.status(400).json({ 
        message: 'Already applied to this course' 
      });
    }

    // Check if student qualifies for this course
    const student = data.users.find(u => u.id === studentId);
    const course = data.courses.find(c => c.id === courseId);
    
    if (student.studentType === 'highschool' && course.level === 'postgraduate') {
      return res.status(400).json({ 
        message: 'You do not meet the qualifications for this course' 
      });
    }

    const application = {
      id: Date.now().toString(),
      studentId,
      courseId,
      institutionId,
      personalStatement,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    data.applications.push(application);
    req.storage.writeData(data);

    res.json({
      message: 'Application submitted successfully',
      applicationId: application.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Application failed' });
  }
});

// Upload transcript (PDF only)
router.post('/upload-transcript', (req, res) => {
  try {
    const { studentId, studentType, fileName, fileData } = req.body;
    const data = req.storage.readData();

    // Validate file type (PDF only)
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ 
        message: 'Only PDF files are allowed for transcripts' 
      });
    }

    const transcript = {
      id: Date.now().toString(),
      studentId,
      studentType,
      fileName,
      fileData, // In real app, store file in cloud storage
      fileType: 'pdf',
      status: 'verified',
      uploadedAt: new Date().toISOString()
    };

    data.transcripts.push(transcript);
    req.storage.writeData(data);

    res.json({
      message: 'Transcript uploaded successfully',
      transcriptId: transcript.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get student notifications
router.get('/notifications/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const data = req.storage.readData();

    // Get student's applications
    const studentApplications = data.applications.filter(app => app.studentId === studentId);
    
    // Generate notifications based on application status changes
    const notifications = studentApplications
      .filter(app => app.updatedAt && app.updatedAt !== app.appliedAt)
      .map(app => {
        const course = data.courses.find(c => c.id === app.courseId);
        const institution = data.institutions.find(inst => inst.id === app.institutionId);
        
        return {
          id: `notif-${app.id}`,
          title: `Application Status Update - ${course?.name || 'Unknown Course'}`,
          message: `Your application for ${course?.name || 'Unknown Course'} at ${institution?.name || 'Unknown Institution'} has been ${app.status}.`,
          type: 'application_update',
          read: false,
          createdAt: app.updatedAt
        };
      });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

module.exports = router;