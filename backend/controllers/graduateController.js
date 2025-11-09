const graduateController = {
  getQualifiedJobs: (req, res) => {
    try {
      const { graduateId } = req.params;
      const data = req.storage.readData();

      // Get graduate's transcripts and qualifications
      const graduateTranscripts = data.transcripts.filter(t => t.studentId === graduateId);
      
      // Mock job matching logic
      const qualifiedJobs = data.jobs.filter(job => {
        // Simple qualification matching
        return job.level === 'Entry' || job.level === 'Junior';
      });

      res.json(qualifiedJobs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching qualified jobs' });
    }
  },

  applyForJob: (req, res) => {
    try {
      const { graduateId, jobId, coverLetter } = req.body;
      const data = req.storage.readData();

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
  },

  getGraduateApplications: (req, res) => {
    try {
      const { graduateId } = req.params;
      const data = req.storage.readData();
      
      const applications = data.applications.filter(app => app.studentId === graduateId && app.jobId);
      
      // Enrich with job details
      const enrichedApplications = applications.map(app => {
        const job = data.jobs.find(j => j.id === app.jobId);
        return {
          ...app,
          jobTitle: job ? job.title : 'Unknown Job',
          company: job ? job.company : 'Unknown Company'
        };
      });

      res.json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  }
};

module.exports = graduateController;