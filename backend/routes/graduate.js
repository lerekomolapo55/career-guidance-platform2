const express = require('express');
const router = express.Router();

// Get graduate dashboard
router.get('/dashboard/:graduateId', (req, res) => {
  try {
    const { graduateId } = req.params;
    const data = req.storage.readData();

    const graduateApplications = data.applications.filter(app => 
      app.studentId === graduateId && app.jobId
    );
    const graduateTranscripts = data.transcripts.filter(t => t.studentId === graduateId);

    const stats = {
      totalApplications: graduateApplications.length,
      pendingApplications: graduateApplications.filter(app => app.status === 'pending').length,
      admittedApplications: graduateApplications.filter(app => app.status === 'admitted').length,
      rejectedApplications: graduateApplications.filter(app => app.status === 'rejected').length,
      totalTranscripts: graduateTranscripts.length
    };

    res.json({
      stats,
      recentApplications: graduateApplications.slice(-5),
      transcripts: graduateTranscripts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching graduate dashboard' });
  }
});

// Get qualified jobs for graduate
router.get('/qualified-jobs/:graduateId', (req, res) => {
  try {
    const { graduateId } = req.params;
    const data = req.storage.readData();

    // Get graduate's profile and transcripts
    const graduate = data.users.find(user => user.id === graduateId);
    const transcripts = data.transcripts.filter(t => t.studentId === graduateId);

    // Simple job matching algorithm
    const qualifiedJobs = data.jobs.filter(job => {
      // Check if graduate meets basic requirements
      if (job.level === 'Senior' && transcripts.length === 0) {
        return false;
      }
      
      // Graduates are qualified for entry-level and junior positions
      return job.level === 'Entry' || job.level === 'Junior' || job.level === 'Internship';
    });

    // Enrich jobs with application status
    const jobsWithStatus = qualifiedJobs.map(job => {
      const application = data.applications.find(app => 
        app.studentId === graduateId && app.jobId === job.id
      );
      
      return {
        ...job,
        hasApplied: !!application,
        applicationStatus: application ? application.status : null
      };
    });

    res.json(jobsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching qualified jobs' });
  }
});

// Apply for job
router.post('/apply-job', (req, res) => {
  try {
    const { graduateId, jobId, coverLetter } = req.body;
    const data = req.storage.readData();

    // Check if already applied
    const existingApplication = data.applications.find(app => 
      app.studentId === graduateId && app.jobId === jobId
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const application = {
      id: Date.now().toString(),
      studentId: graduateId,
      jobId,
      coverLetter,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    data.applications.push(application);
    req.storage.writeData(data);

    res.json({
      message: 'Job application submitted successfully',
      applicationId: application.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Application failed' });
  }
});

// Get graduate job applications
router.get('/applications/:graduateId', (req, res) => {
  try {
    const { graduateId } = req.params;
    const data = req.storage.readData();
    
    const applications = data.applications.filter(app => 
      app.studentId === graduateId && app.jobId
    );
    
    // Enrich with job details
    const enrichedApplications = applications.map(app => {
      const job = data.jobs.find(j => j.id === app.jobId);
      return {
        ...app,
        jobTitle: job ? job.title : 'Unknown Job',
        company: job ? job.company : 'Unknown Company',
        location: job ? job.location : 'Unknown Location',
        type: job ? job.type : 'Unknown Type'
      };
    });

    res.json(enrichedApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

module.exports = router;