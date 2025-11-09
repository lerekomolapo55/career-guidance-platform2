const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Get admin dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    const data = req.storage.readData();
    
    const stats = {
      totalInstitutions: data.institutions.length,
      totalCompanies: data.users.filter(user => user.userType === 'company' && user.isApproved).length,
      totalUsers: data.users.length,
      totalApplications: data.applications.length,
      pendingApprovals: data.users.filter(user => !user.isApproved && (user.userType === 'company' || user.userType === 'institution')).length,
      activeCourses: data.courses.filter(course => course.status === 'active').length,
      totalJobs: data.jobs.length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get all institutions
router.get('/institutions', (req, res) => {
  try {
    const data = req.storage.readData();
    res.json(data.institutions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Add new institution
router.post('/institutions', async (req, res) => {
  try {
    const { name, location, type, established, description, website, contact } = req.body;
    
    if (!name || !location || !type) {
      return res.status(400).json({ message: 'Name, location, and type are required' });
    }

    const data = req.storage.readData();

    const newInstitution = {
      id: Date.now().toString(),
      name,
      location,
      type,
      established: established || '',
      description: description || '',
      website: website || '',
      contact: contact || {},
      isActive: true,
      createdAt: new Date().toISOString()
    };

    data.institutions.push(newInstitution);
    req.storage.writeData(data);

    res.status(201).json({
      message: 'Institution added successfully',
      institution: newInstitution
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding institution' });
  }
});

// Update institution
router.put('/institutions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const data = req.storage.readData();

    const institutionIndex = data.institutions.findIndex(inst => inst.id === id);
    if (institutionIndex === -1) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    data.institutions[institutionIndex] = {
      ...data.institutions[institutionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    req.storage.writeData(data);

    res.json({
      message: 'Institution updated successfully',
      institution: data.institutions[institutionIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating institution' });
  }
});

// Delete institution
router.delete('/institutions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.storage.readData();

    const institutionIndex = data.institutions.findIndex(inst => inst.id === id);
    if (institutionIndex === -1) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    data.institutions.splice(institutionIndex, 1);
    req.storage.writeData(data);

    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting institution' });
  }
});

// Get all companies
router.get('/companies', (req, res) => {
  try {
    const data = req.storage.readData();
    const companies = data.users.filter(user => user.userType === 'company');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Add new company (admin can add companies directly)
router.post('/companies', async (req, res) => {
  try {
    const { companyName, email, password, industry, location, description } = req.body;
    
    if (!companyName || !email || !password || !industry || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = req.storage.readData();

    // Check if company already exists
    const existingCompany = data.users.find(user => 
      user.userType === 'company' && user.email === email
    );
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists with this email' });
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
      description: description || '',
      isVerified: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    data.users.push(newCompany);
    req.storage.writeData(data);

    res.status(201).json({
      message: 'Company added successfully',
      company: {
        id: newCompany.id,
        companyName: newCompany.companyName,
        email: newCompany.email,
        industry: newCompany.industry,
        location: newCompany.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding company' });
  }
});

// Approve company
router.put('/companies/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.storage.readData();

    const company = data.users.find(user => user.id === id && user.userType === 'company');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isApproved = true;
    company.updatedAt = new Date().toISOString();
    req.storage.writeData(data);

    res.json({ message: 'Company approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving company' });
  }
});

// Suspend company
router.put('/companies/:id/suspend', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.storage.readData();

    const company = data.users.find(user => user.id === id && user.userType === 'company');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isApproved = false;
    company.updatedAt = new Date().toISOString();
    req.storage.writeData(data);

    res.json({ message: 'Company suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending company' });
  }
});

// Delete company
router.delete('/companies/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.storage.readData();

    const companyIndex = data.users.findIndex(user => user.id === id && user.userType === 'company');
    if (companyIndex === -1) {
      return res.status(404).json({ message: 'Company not found' });
    }

    data.users.splice(companyIndex, 1);
    req.storage.writeData(data);

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company' });
  }
});

// Get all users
router.get('/users', (req, res) => {
  try {
    const data = req.storage.readData();
    
    // Return users without passwords
    const users = data.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get pending approvals
router.get('/pending-approvals', (req, res) => {
  try {
    const data = req.storage.readData();
    const pending = data.users.filter(user => 
      !user.isApproved && (user.userType === 'company' || user.userType === 'institution')
    );
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
});

// Get system reports
router.get('/reports', (req, res) => {
  try {
    const data = req.storage.readData();
    
    const reports = {
      userGrowth: {
        total: data.users.length,
        students: data.users.filter(u => u.userType === 'student').length,
        institutions: data.users.filter(u => u.userType === 'institution').length,
        companies: data.users.filter(u => u.userType === 'company').length,
        admins: data.users.filter(u => u.userType === 'admin').length
      },
      applicationStats: {
        total: data.applications.length,
        pending: data.applications.filter(a => a.status === 'pending').length,
        approved: data.applications.filter(a => a.status === 'approved').length,
        rejected: data.applications.filter(a => a.status === 'rejected').length,
        waitlisted: data.applications.filter(a => a.status === 'waiting').length
      },
      courseStats: {
        total: data.courses.length,
        active: data.courses.filter(c => c.status === 'active').length,
        byInstitution: data.institutions.map(inst => ({
          name: inst.name,
          courses: data.courses.filter(c => c.institutionId === inst.id).length
        }))
      },
      jobStats: {
        total: data.jobs.length,
        active: data.jobs.filter(j => j.status === 'active').length
      }
    };

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error generating reports' });
  }
});

module.exports = router;