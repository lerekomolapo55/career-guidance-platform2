const express = require('express');
const router = express.Router();

// Get user notifications
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.storage.readData();

    // Mock notifications - in real app, you'd have a notifications collection
    const notifications = [
      {
        id: 1,
        userId,
        title: 'Application Received',
        message: 'Your application for Computer Science has been received.',
        type: 'application',
        read: false,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        userId,
        title: 'New Job Opportunity',
        message: 'A new job matching your profile has been posted.',
        type: 'job_alert',
        read: true,
        createdAt: '2024-01-14T15:30:00Z'
      }
    ];

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // In real app, update notification in database
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Create notification
router.post('/', (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    // In real app, create notification in database
    const newNotification = {
      id: Date.now(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Notification created successfully',
      notification: newNotification
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
});

module.exports = router;