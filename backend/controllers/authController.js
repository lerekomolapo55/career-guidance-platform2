const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  registerStudent: async (req, res) => {
    try {
      const { name, email, password, studentType } = req.body;
      const data = req.storage.readData();
      
      const existingUser = data.users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        userType: 'student',
        studentType: studentType || 'highschool',
        isVerified: true, // Skip email verification for now
        createdAt: new Date().toISOString()
      };

      data.users.push(newUser);
      req.storage.writeData(data);

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
      res.status(500).json({ message: 'Registration failed' });
    }
  },

  registerCompany: async (req, res) => {
    try {
      const { companyName, email, password, industry, location } = req.body;
      const data = req.storage.readData();
      
      const existingUser = data.users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Company already registered' });
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
        isApproved: true, // Auto-approve for demo
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
        message: 'Company registered successfully',
        token,
        user: {
          id: newCompany.id,
          name: newCompany.companyName,
          email: newCompany.email,
          userType: newCompany.userType
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed' });
    }
  },

  registerInstitution: async (req, res) => {
    try {
      const { institutionName, email, password, location, type } = req.body;
      const data = req.storage.readData();
      
      const existingUser = data.users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Institution already registered' });
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
        isApproved: true, // Auto-approve for demo
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
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const data = req.storage.readData();

      const user = data.users.find(user => user.email === email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name || user.companyName || user.institutionName,
          email: user.email,
          userType: user.userType,
          studentType: user.studentType
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  }
};

module.exports = authController;