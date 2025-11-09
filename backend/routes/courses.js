const express = require('express');
const router = express.Router();

// Get all courses
router.get('/', (req, res) => {
  try {
    const data = req.storage.readData();
    res.json(data.courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Get courses by institution
router.get('/institution/:institutionId', (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = req.storage.readData();

    const institutionCourses = data.courses.filter(course => course.institutionId === institutionId);
    res.json(institutionCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institution courses' });
  }
});

// Get course by ID
router.get('/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const data = req.storage.readData();

    const course = data.courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course' });
  }
});

// Create new course
router.post('/', (req, res) => {
  try {
    const { institutionId, name, faculty, credits, fees, duration, requirements, description } = req.body;
    const data = req.storage.readData();

    const newCourse = {
      id: Date.now().toString(),
      institutionId,
      name,
      faculty,
      credits: parseInt(credits),
      fees: parseInt(fees),
      duration,
      requirements,
      description,
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
});

// Update course
router.put('/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    const data = req.storage.readData();

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

// Delete course
router.delete('/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const data = req.storage.readData();

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

module.exports = router;