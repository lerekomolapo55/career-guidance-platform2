const express = require('express');
const router = express.Router();

// Get company dashboard
router.get('/dashboard/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const data = req.storage.readData();

    const companyJobs = data.jobs.filter(job => job.companyId === companyId);
    const companyApplications = data.applications.filter(app => 
      companyJobs.some(job => job.id === app.jobId)
    );

    const stats = {
      totalJobs: companyJobs.length,
      activeJobs: companyJobs.filter(job => job.status === 'active').length,
      totalApplications: companyApplications.length,
      pendingApplications: companyApplications.filter(app => app.status === 'pending').length,
      approvedApplications: companyApplications.filter(app => app.status === 'approved').length,
      rejectedApplications: companyApplications.filter(app => app.status === 'rejected').length
    };

    res.json({
      stats,
      recentJobs: companyJobs.slice(-5),
      recentApplications: companyApplications.slice(-5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company dashboard' });
  }
});

// Post new job with detailed requirements
router.post('/jobs', (req, res) => {
  try {
    const { 
      companyId, 
      title, 
      description, 
      requirements, 
      salary, 
      type, 
      location, 
      level,
      educationLevel,
      experience,
      skills
    } = req.body;
    
    const data = req.storage.readData();

    const newJob = {
      id: Date.now().toString(),
      companyId,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      salary,
      type,
      location,
      level,
      educationLevel,
      experience,
      skills: Array.isArray(skills) ? skills : [skills],
      status: 'active',
      postedAt: new Date().toISOString()
    };

    data.jobs.push(newJob);
    req.storage.writeData(data);

    res.status(201).json({
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    res.status(500).json({ message: 'Error posting job' });
  }
});

// Get qualified applicants for a job
router.get('/jobs/:jobId/qualified-applicants', (req, res) => {
  try {
    const { jobId } = req.params;
    const data = req.storage.readData();

    const job = data.jobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobApplications = data.applications.filter(app => app.jobId === jobId);
    
    // Filter and score applicants based on qualifications
    const qualifiedApplicants = jobApplications.map(app => {
      const student = data.users.find(user => user.id === app.studentId);
      const transcripts = data.transcripts.filter(t => t.studentId === app.studentId);
      
      // Calculate qualification score (simplified)
      let score = 0;
      
      // Academic performance (based on transcripts)
      if (transcripts.length > 0) score += 30;
      
      // Education level match
      if (student?.studentType === 'graduate' && job.level !== 'Internship') score += 20;
      
      // Skills match (simplified)
      if (student?.skills && job.skills) {
        const matchingSkills = student.skills.filter(skill => 
          job.skills.includes(skill)
        );
        score += matchingSkills.length * 5;
      }
      
      return {
        ...app,
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : '',
        studentType: student ? student.studentType : '',
        transcripts: transcripts,
        qualificationScore: score,
        isQualified: score >= 40 // Threshold for qualification
      };
    }).filter(applicant => applicant.isQualified)
      .sort((a, b) => b.qualificationScore - a.qualificationScore);

    res.json(qualifiedApplicants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching qualified applicants' });
  }
});

// Update application status with waitlist support
router.put('/applications/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;
    const data = req.storage.readData();

    const application = data.applications.find(app => app.id === applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.feedback = feedback;
    application.updatedAt = new Date().toISOString();
    req.storage.writeData(data);

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application' });
  }
});

module.exports = router;