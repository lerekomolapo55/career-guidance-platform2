const jwt = require('jsonwebtoken');

const auth = {
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid token.' });
    }
  },

  requireAdmin: (req, res, next) => {
    // In real app, check if user is admin from database
    // For demo, we'll assume admin check is done in the route
    next();
  },

  requireInstitution: (req, res, next) => {
    // In real app, check if user is institution from database
    next();
  },

  requireStudent: (req, res, next) => {
    // In real app, check if user is student from database
    next();
  },

  requireCompany: (req, res, next) => {
    // In real app, check if user is company from database
    next();
  }
};

module.exports = auth;