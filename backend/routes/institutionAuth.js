const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Institution Registration
router.post('/register', async (req, res) => {
  try {
    const { institutionName, email, password, location, type, established, description } = req.body;
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
      established,
      description,
      isVerified: true,
      isApproved: true,
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
      message: 'Institution registered successfully',
      token,
      user: {
        id: newInstitution.id,
        name: newInstitution.institutionName,
        email: newInstitution.email,
        userType: newInstitution.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Institution Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = req.storage.readData();

    const institution = data.users.find(user => 
      user.email === email && user.userType === 'institution'
    );
    
    if (!institution) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, institution.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: institution.id, email: institution.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: institution.id,
        name: institution.institutionName,
        email: institution.email,
        userType: institution.userType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get institution profile
router.get('/profile/:institutionId', (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = req.storage.readData();

    const institution = data.users.find(user => 
      user.id === institutionId && user.userType === 'institution'
    );

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institution profile' });
  }
});

module.exports = router;