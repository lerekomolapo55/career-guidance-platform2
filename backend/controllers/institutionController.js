const institutionController = {
  createCourse: (req, res) => {
    try {
      const { institutionId, name, faculty, credits, fees, duration, requirements } = req.body;
      const data = req.storage.readData();

      const newCourse = {
        id: Date.now().toString(),
        institutionId,
        name,
        faculty,
        credits,
        fees,
        duration,
        requirements,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      data.courses.push(newCourse);
      req.storage.writeData(data);

      res.status(201).json({
        message: 'Course created successfully',
        course: newCourse
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating course' });
    }
  },

  getInstitutionCourses: (req, res) => {
    try {
      const { institutionId } = req.params;
      const data = req.storage.readData();

      const courses = data.courses.filter(course => course.institutionId === institutionId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching courses' });
    }
  },

  getInstitutionApplications: (req, res) => {
    try {
      const { institutionId } = req.params;
      const data = req.storage.readData();

      // Get courses for this institution
      const institutionCourses = data.courses.filter(course => course.institutionId === institutionId);
      const courseIds = institutionCourses.map(course => course.id);
      
      // Get applications for these courses
      const applications = data.applications.filter(app => courseIds.includes(app.courseId));
      
      // Enrich with student and course details
      const enrichedApplications = applications.map(app => {
        const student = data.users.find(user => user.id === app.studentId);
        const course = data.courses.find(c => c.id === app.courseId);
        
        return {
          ...app,
          studentName: student ? student.name : 'Unknown Student',
          studentEmail: student ? student.email : '',
          courseName: course ? course.name : 'Unknown Course'
        };
      });

      res.json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  },

  updateApplicationStatus: (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;
      const data = req.storage.readData();

      const application = data.applications.find(app => app.id === applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      application.status = status;
      application.updatedAt = new Date().toISOString();
      req.storage.writeData(data);

      res.json({ message: 'Application status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating application' });
    }
  }
};

module.exports = institutionController;