const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Student Registration
router.post('/register/student', async (req, res) => {
  try {
    const { name, email, password, studentType } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !studentType) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, studentType' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const data = req.storage.readData();
    
    // Check if user exists
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      userType: 'student',
      studentType: studentType,
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    req.storage.writeData(data);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        studentType: newUser.studentType
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Company Registration
router.post('/register/company', async (req, res) => {
  try {
    const { companyName, email, password, industry, location } = req.body;
    
    // Validate required fields
    if (!companyName || !email || !password || !industry || !location) {
      return res.status(400).json({ 
        message: 'All fields are required: companyName, email, password, industry, location' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const data = req.storage.readData();
    
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Company already registered with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newCompany = {
      id: Date.now().toString(),
      companyName,
      email,
      password: hashedPassword,
      userType: 'company',
      industry,
      location,
      isVerified: true,
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    data.users.push(newCompany);
    req.storage.writeData(data);

    const token = jwt.sign(
      { userId: newCompany.id, email: newCompany.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Company registered successfully. Waiting for admin approval.',
      token,
      user: {
        id: newCompany.id,
        name: newCompany.companyName,
        email: newCompany.email,
        userType: newCompany.userType
      }
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ message: 'Company registration failed' });
  }
});

// Institution Registration
router.post('/register/institution', async (req, res) => {
  try {
    const { institutionName, email, password, location, type } = req.body;
    
    // Validate required fields
    if (!institutionName || !email || !password || !location || !type) {
      return res.status(400).json({ 
        message: 'All fields are required: institutionName, email, password, location, type' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const data = req.storage.readData();
    
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Institution already registered with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newInstitution = {
      id: Date.now().toString(),
      institutionName,
      email,
      password: hashedPassword,
      userType: 'institution',
      location,
      type,
      isVerified: true,
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    data.users.push(newInstitution);
    req.storage.writeData(data);

    const token = jwt.sign(
      { userId: newInstitution.id, email: newInstitution.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Institution registered successfully. Waiting for admin approval.',
      token,
      user: {
        id: newInstitution.id,
        name: newInstitution.institutionName,
        email: newInstitution.email,
        userType: newInstitution.userType
      }
    });
  } catch (error) {
    console.error('Institution registration error:', error);
    res.status(500).json({ message: 'Institution registration failed' });
  }
});

// Admin Registration (for testing)
router.post('/register/admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const data = req.storage.readData();
    
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      userType: 'admin',
      isVerified: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    data.users.push(newAdmin);
    req.storage.writeData(data);

    const token = jwt.sign(
      { userId: newAdmin.id, email: newAdmin.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        userType: newAdmin.userType
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Admin registration failed' });
  }
});

// Login for all user types
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const data = req.storage.readData();

    const user = data.users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data based on user type
    let userData = {
      id: user.id,
      email: user.email,
      userType: user.userType
    };

    // Add type-specific fields
    if (user.userType === 'student') {
      userData.name = user.name;
      userData.studentType = user.studentType;
    } else if (user.userType === 'company') {
      userData.name = user.companyName;
      userData.industry = user.industry;
      userData.location = user.location;
      userData.isApproved = user.isApproved;
    } else if (user.userType === 'institution') {
      userData.name = user.institutionName;
      userData.location = user.location;
      userData.type = user.type;
      userData.isApproved = user.isApproved;
    } else if (user.userType === 'admin') {
      userData.name = user.name;
    }

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    const data = req.storage.readData();
    
    const user = data.users.find(user => user.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userData = {
      id: user.id,
      email: user.email,
      userType: user.userType
    };

    // Add type-specific fields
    if (user.userType === 'student') {
      userData.name = user.name;
      userData.studentType = user.studentType;
    } else if (user.userType === 'company') {
      userData.name = user.companyName;
      userData.industry = user.industry;
      userData.location = user.location;
      userData.isApproved = user.isApproved;
    } else if (user.userType === 'institution') {
      userData.name = user.institutionName;
      userData.location = user.location;
      userData.type = user.type;
      userData.isApproved = user.isApproved;
    } else if (user.userType === 'admin') {
      userData.name = user.name;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;