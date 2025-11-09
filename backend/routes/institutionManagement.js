const express = require('express');
const router = express.Router();

router.get('/courses/:institutionId', (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = req.storage.readData();
    
    const institution = data.institutions.find(inst => inst.id === institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }
    
    const institutionCourses = data.courses ? data.courses.filter(course => 
      course.institutionName === institution.name
    ) : [];
    
    res.json(institutionCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

router.post('/courses', (req, res) => {
  try {
    const { name, faculty, credits, fees, duration, level, requirements, description, institutionId, institutionName } = req.body;
    
    if (!name || !faculty || !credits || !fees || !duration || !level || !institutionId || !institutionName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const data = req.storage.readData();

    const newCourse = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      institutionId,
      institutionName,
      name,
      faculty,
      credits: parseInt(credits),
      fees: parseInt(fees),
      duration,
      level,
      requirements: requirements || '',
      description: description || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!data.courses) data.courses = [];
    data.courses.push(newCourse);
    req.storage.writeData(data);

    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course' });
  }
});

router.put('/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    const data = req.storage.readData();

    if (!data.courses) {
      return res.status(404).json({ message: 'No courses found' });
    }

    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found' });
    }

    data.courses[courseIndex] = {
      ...data.courses[courseIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    req.storage.writeData(data);

    res.json({
      message: 'Course updated successfully',
      course: data.courses[courseIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course' });
  }
});

router.delete('/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const data = req.storage.readData();

    if (!data.courses) {
      return res.status(404).json({ message: 'No courses found' });
    }

    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found' });
    }

    data.courses.splice(courseIndex, 1);
    req.storage.writeData(data);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' });
  }
});

router.get('/applications/:institutionId', (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = req.storage.readData();

    const institution = data.institutions.find(inst => inst.id === institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    const institutionCourses = data.courses ? data.courses.filter(course => 
      course.institutionName === institution.name
    ) : [];
    const courseIds = institutionCourses.map(course => course.id);
    
    const applications = data.applications ? data.applications.filter(app => courseIds.includes(app.courseId)) : [];
    
    const enrichedApplications = applications.map(app => {
      const student = data.users ? data.users.find(user => user.id === app.studentId) : null;
      const course = data.courses ? data.courses.find(c => c.id === app.courseId) : null;
      
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
});

router.put('/applications/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;
    const data = req.storage.readData();

    if (!data.applications) {
      return res.status(404).json({ message: 'No applications found' });
    }

    const application = data.applications.find(app => app.id === applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.feedback = feedback || '';
    application.updatedAt = new Date().toISOString();
    req.storage.writeData(data);

    res.json({ 
      message: `Application ${status} successfully`,
      application 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application' });
  }
});

module.exports = router;