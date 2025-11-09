const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'careerguide-secret-key-2024';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Firebase Database Helper Functions
let firebaseHelpers = {};
try {
  const { db } = require('./config/firebase');
  
  firebaseHelpers = {
    readData: async (path = '') => {
      try {
        const snapshot = await db.ref(path).once('value');
        return snapshot.val() || {};
      } catch (error) {
        console.error('Error reading from Firebase:', error);
        return {};
      }
    },
    
    writeData: async (path, data) => {
      try {
        await db.ref(path).set(data);
        return true;
      } catch (error) {
        console.error('Error writing to Firebase:', error);
        return false;
      }
    },
    
    pushData: async (path, data) => {
      try {
        const ref = await db.ref(path).push(data);
        return ref.key;
      } catch (error) {
        console.error('Error pushing to Firebase:', error);
        return null;
      }
    },
    
    updateData: async (path, updates) => {
      try {
        await db.ref(path).update(updates);
        return true;
      } catch (error) {
        console.error('Error updating data in Firebase:', error);
        return false;
      }
    },
    
    deleteData: async (path) => {
      try {
        await db.ref(path).remove();
        return true;
      } catch (error) {
        console.error('Error deleting data from Firebase:', error);
        return false;
      }
    }
  };
  
  console.log('Firebase connected successfully');
} catch (firebaseError) {
  console.log('Firebase initialization failed:', firebaseError.message);
  process.exit(1);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/universities',
    '/api/companies',
    '/api/courses',
    '/api/admin/dashboard',
    '/api/undergraduate/courses',
    '/api/health',
    '/api/test',
    '/api/student/qualified-courses',
    '/api/graduate/jobs',
    '/api/jobs'
  ];
  
  const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
  
  if (isPublicRoute) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.use((req, res, next) => {
  req.firebase = firebaseHelpers;
  next();
});

// Initialize sample data
const initializeSampleData = async () => {
  try {
    const users = await firebaseHelpers.readData('users');
    if (!users || Object.keys(users).length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 12);
      const adminUser = {
        id: 'admin-1',
        name: 'System Administrator',
        email: 'admin@careerguide.ls',
        password: hashedPassword,
        userType: 'admin',
        isVerified: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      };
      await firebaseHelpers.writeData('users/admin-1', adminUser);
      console.log('Admin user created');
    }

    const institutions = await firebaseHelpers.readData('institutions');
    if (!institutions || Object.keys(institutions).length === 0) {
      const sampleInstitutions = {
        'inst-1': {
          id: 'inst-1',
          name: 'National University of Lesotho',
          location: 'Roma, Lesotho',
          type: 'Public University',
          established: '1945',
          description: 'Premier higher education institution in Lesotho',
          contact: { email: 'info@nul.ls' },
          isActive: true,
          createdAt: new Date().toISOString()
        },
        'inst-2': {
          id: 'inst-2',
          name: 'Limkokwing University',
          location: 'Maseru, Lesotho',
          type: 'Private University',
          established: '2008',
          description: 'Creative innovation university',
          contact: { email: 'info@limkokwing.ls' },
          isActive: true,
          createdAt: new Date().toISOString()
        }
      };
      await firebaseHelpers.writeData('institutions', sampleInstitutions);
      console.log('Sample institutions created');
    }

    const courses = await firebaseHelpers.readData('courses');
    if (!courses || Object.keys(courses).length === 0) {
      const sampleCourses = {
        'course-1': {
          id: 'course-1',
          institutionId: 'inst-1',
          institutionName: 'National University of Lesotho',
          name: 'Bachelor of Science in Computer Science',
          faculty: 'Science and Technology',
          credits: 120,
          fees: 15000,
          duration: '4 years',
          level: 'undergraduate',
          requirements: 'High school diploma with mathematics and science subjects. Minimum GPA: 2.5',
          description: 'Comprehensive computer science degree program focusing on programming, algorithms, and software development',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      await firebaseHelpers.writeData('courses', sampleCourses);
      console.log('Sample courses created');
    }

    // Initialize sample companies
    const companies = await firebaseHelpers.readData('companies');
    if (!companies || Object.keys(companies).length === 0) {
      const sampleCompanies = {
        'company-1': {
          id: 'company-1',
          companyName: 'Tech Solutions Lesotho',
          email: 'info@techsolutions.ls',
          industry: 'Information Technology',
          location: 'Maseru, Lesotho',
          description: 'Leading IT solutions provider in Lesotho',
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        'company-2': {
          id: 'company-2',
          companyName: 'Lesotho Bank',
          email: 'careers@lesothobank.ls',
          industry: 'Banking & Finance',
          location: 'Maseru, Lesotho',
          description: 'Premier banking institution in Lesotho',
          isApproved: true,
          createdAt: new Date().toISOString()
        }
      };
      await firebaseHelpers.writeData('companies', sampleCompanies);
      console.log('Sample companies created');
    }

    // Initialize sample jobs
    const jobs = await firebaseHelpers.readData('jobs');
    if (!jobs || Object.keys(jobs).length === 0) {
      const sampleJobs = {
        'job-1': {
          id: 'job-1',
          companyId: 'company-1',
          companyName: 'Tech Solutions Lesotho',
          title: 'Software Developer',
          description: 'We are looking for a skilled software developer to join our dynamic team. The ideal candidate will have experience in web development and a passion for technology.',
          requirements: 'Bachelor degree in Computer Science, 2+ years experience in web development, proficiency in JavaScript and React',
          qualifications: 'BSc in Computer Science or related field',
          location: 'Maseru, Lesotho',
          deadline: '2024-12-31',
          salary: 'M15,000 - M20,000',
          minGPA: '3.0',
          requiredCertificates: 'AWS Certified, Microsoft Certified',
          requiredExperience: '2',
          jobType: 'Full-time',
          status: 'active',
          postedDate: new Date().toISOString().split('T')[0],
          applicants: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      await firebaseHelpers.writeData('jobs', sampleJobs);
      console.log('Sample jobs created');
    }

  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// PDF Analysis Function
const analyzeTranscript = async (fileData) => {
  try {
    console.log('Starting PDF analysis...');
    
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    const data = await pdfParse(pdfBuffer);
    const text = data.text.toLowerCase();
    
    console.log('PDF Text extracted (first 500 chars):', text.substring(0, 500));
    
    const analysis = {
      hasMathematics: text.includes('math') || text.includes('mathematics') || text.includes('calculus') || text.includes('algebra'),
      hasScience: text.includes('science') || text.includes('physics') || text.includes('chemistry') || text.includes('biology'),
      hasCommerce: text.includes('commerce') || text.includes('accounting') || text.includes('economics') || text.includes('business'),
      hasArts: text.includes('art') || text.includes('design') || text.includes('visual') || text.includes('creative') || text.includes('drawing'),
      hasComputerScience: text.includes('computer') || text.includes('programming') || text.includes('coding') || text.includes('software') || text.includes('it'),
      gpa: extractGPA(text),
      level: determineLevel(text),
      subjects: extractSubjects(text),
      rawText: text.substring(0, 1000)
    };
    
    console.log('Transcript analysis result:', analysis);
    return analysis;
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    return {
      hasMathematics: true,
      hasScience: true,
      hasCommerce: true,
      hasArts: true,
      hasComputerScience: true,
      gpa: 3.0,
      level: 'highschool',
      subjects: ['mathematics', 'science', 'commerce', 'arts', 'computer'],
      analysisError: true,
      errorMessage: error.message
    };
  }
};

// Helper function to extract GPA from transcript text
const extractGPA = (text) => {
  const gpaPatterns = [
    /gpa[\s:]*([0-9]\.[0-9])/i,
    /grade point average[\s:]*([0-9]\.[0-9])/i,
    /cumulative gpa[\s:]*([0-9]\.[0-9])/i,
    /overall gpa[\s:]*([0-9]\.[0-9])/i
  ];
  
  for (const pattern of gpaPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const gpa = parseFloat(match[1]);
      if (gpa >= 1.0 && gpa <= 4.0) {
        console.log('GPA found:', gpa);
        return gpa;
      }
    }
  }
  
  const numberMatches = text.match(/([0-9]\.[0-9])/g);
  if (numberMatches) {
    const numbers = numberMatches.map(parseFloat).filter(num => num >= 1.0 && num <= 4.0);
    if (numbers.length > 0) {
      const highestGPA = Math.max(...numbers);
      console.log('GPA fallback found:', highestGPA);
      return highestGPA;
    }
  }
  
  console.log('No GPA found, using default: 3.0');
  return 3.0;
};

// Helper function to determine education level
const determineLevel = (text) => {
  if (text.includes('high school') || text.includes('secondary') || text.includes('form') || text.includes('lgcse') || text.includes('cosc')) {
    return 'highschool';
  } else if (text.includes('bachelor') || text.includes('undergraduate') || text.includes('degree') || text.includes('bsc') || text.includes('ba')) {
    return 'undergraduate';
  } else if (text.includes('master') || text.includes('postgraduate') || text.includes('graduate') || text.includes('msc') || text.includes('ma')) {
    return 'postgraduate';
  } else {
    return 'highschool';
  }
};

// Helper function to extract subjects
const extractSubjects = (text) => {
  const subjects = [];
  const subjectKeywords = {
    mathematics: ['math', 'mathematics', 'calculus', 'algebra', 'statistics'],
    science: ['physics', 'chemistry', 'biology', 'science', 'natural science'],
    commerce: ['accounting', 'economics', 'business', 'commerce', 'finance'],
    arts: ['art', 'design', 'visual', 'creative', 'drawing', 'painting'],
    computer: ['computer', 'programming', 'coding', 'software', 'it', 'information technology']
  };
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      subjects.push(subject);
    }
  }
  
  return subjects.length > 0 ? subjects : ['general'];
};

// Course qualification logic
const qualifiesForCourse = (transcriptAnalysis, course) => {
  const { level, gpa, hasMathematics, analysisError } = transcriptAnalysis;
  
  console.log(`Checking qualification for: ${course.name}`);
  
  if (analysisError) {
    console.log('PDF analysis failed, qualifying for undergraduate courses');
    return course.level === 'undergraduate';
  }
  
  if (course.level === 'postgraduate') {
    if (level === 'highschool') {
      console.log('High school student cannot apply for postgraduate course');
      return false;
    }
  }
  
  let requiredGPA = 2.0;
  const gpaMatch = course.requirements.toLowerCase().match(/gpa[\s:]*([0-9]\.[0-9])/);
  if (gpaMatch && gpaMatch[1]) {
    requiredGPA = parseFloat(gpaMatch[1]);
  }
  
  if (gpa < requiredGPA) {
    console.log(`GPA too low: ${gpa} < ${requiredGPA}`);
    return false;
  }
  
  const faculty = course.faculty.toLowerCase();
  const courseName = course.name.toLowerCase();
  
  if ((faculty.includes('science') || faculty.includes('technology') || courseName.includes('computer')) && !hasMathematics) {
    console.log('Missing mathematics for science/tech course');
    return false;
  }
  
  if ((faculty.includes('business') || faculty.includes('commerce') || courseName.includes('commerce') || courseName.includes('business')) && !hasMathematics) {
    console.log('Missing mathematics for business course');
    return false;
  }
  
  console.log('No specific requirements found, defaulting to qualified');
  return true;
};

// Helper function to calculate match score
const calculateMatchScore = (analysis, course) => {
  let score = 0;
  
  if (course.level === 'undergraduate' && analysis.level === 'highschool') {
    score += 40;
  } else if (course.level === 'postgraduate' && analysis.level === 'undergraduate') {
    score += 40;
  } else if (course.level === analysis.level) {
    score += 30;
  } else {
    score += 10;
  }
  
  let requiredGPA = 2.0;
  const gpaMatch = course.requirements.toLowerCase().match(/gpa[\s:]*([0-9]\.[0-9])/);
  if (gpaMatch && gpaMatch[1]) {
    requiredGPA = parseFloat(gpaMatch[1]);
  }
  
  if (analysis.gpa >= requiredGPA + 0.5) {
    score += 30;
  } else if (analysis.gpa >= requiredGPA) {
    score += 25;
  } else {
    score += 10;
  }
  
  const faculty = course.faculty.toLowerCase();
  if ((faculty.includes('science') || faculty.includes('technology')) && analysis.hasScience && analysis.hasMathematics) {
    score += 30;
  } else if (faculty.includes('business') && analysis.hasCommerce && analysis.hasMathematics) {
    score += 30;
  } else if (faculty.includes('art') && analysis.hasArts) {
    score += 30;
  } else if (faculty.includes('computer') && analysis.hasComputerScience && analysis.hasMathematics) {
    score += 30;
  } else {
    if (analysis.hasMathematics) score += 10;
    if (analysis.hasScience) score += 10;
    if (analysis.hasCommerce) score += 10;
    if (analysis.hasArts) score += 10;
    if (analysis.hasComputerScience) score += 10;
  }
  
  const finalScore = Math.min(100, Math.max(0, score));
  console.log(`Match score for ${course.name}: ${finalScore}`);
  return finalScore;
};

// Apply authentication middleware
app.use(authenticateToken);

// ==================== AUTHENTICATION ROUTES ====================

// Student registration
app.post('/api/auth/register/student', async (req, res) => {
  try {
    const { name, email, password, studentType } = req.body;
    
    if (!name || !email || !password || !studentType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await req.firebase.readData('users');
    const existingUser = Object.values(users || {}).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `user-${Date.now()}`;
    
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      userType: 'student',
      studentType,
      isVerified: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    await req.firebase.writeData(`users/${userId}`, newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        studentType: newUser.studentType
      },
      token
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Error registering student' });
  }
});

// Company registration
app.post('/api/auth/register/company', async (req, res) => {
  try {
    const { companyName, email, password, industry, location, description } = req.body;
    
    if (!companyName || !email || !password || !industry || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await req.firebase.readData('users');
    const existingUser = Object.values(users || {}).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `user-${Date.now()}`;
    const companyId = `company-${Date.now()}`;

    const newUser = {
      id: userId,
      companyName,
      email,
      password: hashedPassword,
      userType: 'company',
      industry,
      location,
      description: description || '',
      isVerified: true,
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    const newCompany = {
      id: companyId,
      companyName,
      email,
      industry,
      location,
      description: description || '',
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    await Promise.all([
      req.firebase.writeData(`users/${userId}`, newUser),
      req.firebase.writeData(`companies/${companyId}`, newCompany)
    ]);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Company registered successfully. Waiting for admin approval.',
      user: {
        id: newUser.id,
        companyName: newUser.companyName,
        email: newUser.email,
        userType: newUser.userType,
        isApproved: newUser.isApproved
      },
      token
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ message: 'Error registering company' });
  }
});

// Institution registration
app.post('/api/auth/register/institution', async (req, res) => {
  try {
    const { institutionName, email, password, location, type, established, description } = req.body;
    
    if (!institutionName || !email || !password || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await req.firebase.readData('users');
    const existingUser = Object.values(users || {}).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `user-${Date.now()}`;
    const institutionId = `inst-${Date.now()}`;

    const newUser = {
      id: userId,
      institutionName,
      email,
      password: hashedPassword,
      userType: 'institution',
      location,
      type: type || 'public',
      established: established || '',
      description: description || '',
      isVerified: true,
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    const newInstitution = {
      id: institutionId,
      name: institutionName,
      location,
      type: type || 'public',
      established: established || '',
      description: description || '',
      contact: { email },
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await Promise.all([
      req.firebase.writeData(`users/${userId}`, newUser),
      req.firebase.writeData(`institutions/${institutionId}`, newInstitution)
    ]);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Institution registered successfully. Waiting for admin approval.',
      user: {
        id: newUser.id,
        institutionName: newUser.institutionName,
        email: newUser.email,
        userType: newUser.userType,
        isApproved: newUser.isApproved
      },
      token
    });
  } catch (error) {
    console.error('Institution registration error:', error);
    res.status(500).json({ message: 'Error registering institution' });
  }
});

// Admin registration
app.post('/api/auth/register/admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await req.firebase.readData('users');
    const existingUser = Object.values(users || {}).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `user-${Date.now()}`;

    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      userType: 'admin',
      isVerified: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    await req.firebase.writeData(`users/${userId}`, newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType
      },
      token
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Error registering admin' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await req.firebase.readData('users');
    const user = Object.values(users || {}).find(user => user.email === email);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if ((user.userType === 'company' || user.userType === 'institution') && !user.isApproved) {
      return res.status(400).json({ 
        message: 'Your account is pending admin approval. Please wait for approval before logging in.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      name: user.name,
      studentType: user.studentType,
      companyName: user.companyName,
      institutionName: user.institutionName,
      isApproved: user.isApproved,
      industry: user.industry,
      location: user.location
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get admin dashboard stats
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [institutions, companies, users, courses, applications, transcripts, jobs] = await Promise.all([
      req.firebase.readData('institutions'),
      req.firebase.readData('companies'),
      req.firebase.readData('users'),
      req.firebase.readData('courses'),
      req.firebase.readData('applications'),
      req.firebase.readData('transcripts'),
      req.firebase.readData('jobs')
    ]);

    const institutionsArray = Object.values(institutions || {});
    const companiesArray = Object.values(companies || {});
    const usersArray = Object.values(users || {});
    const coursesArray = Object.values(courses || {});
    const applicationsArray = Object.values(applications || {});
    const transcriptsArray = Object.values(transcripts || {});
    const jobsArray = Object.values(jobs || {});

    const stats = {
      totalInstitutions: institutionsArray.length,
      totalCompanies: companiesArray.filter(c => c.isApproved).length,
      totalUsers: usersArray.length,
      pendingApprovals: companiesArray.filter(c => !c.isApproved).length + 
                       usersArray.filter(u => (u.userType === 'institution' || u.userType === 'company') && !u.isApproved).length,
      totalCourses: coursesArray.length,
      totalApplications: applicationsArray.length,
      totalTranscripts: transcriptsArray.length,
      totalJobs: jobsArray.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get all institutions for admin
app.get('/api/admin/institutions', async (req, res) => {
  try {
    const institutions = await req.firebase.readData('institutions');
    const institutionsArray = Object.values(institutions || {});
    res.json(institutionsArray);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Get all companies for admin
app.get('/api/admin/companies', async (req, res) => {
  try {
    const companies = await req.firebase.readData('companies');
    const companiesArray = Object.values(companies || {});
    res.json(companiesArray);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Get all users for admin
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await req.firebase.readData('users');
    const usersArray = Object.values(users || {});
    
    // Remove passwords from response
    const usersWithoutPasswords = usersArray.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get pending approvals
app.get('/api/admin/pending-approvals', async (req, res) => {
  try {
    const [companies, users] = await Promise.all([
      req.firebase.readData('companies'),
      req.firebase.readData('users')
    ]);

    const companiesArray = Object.values(companies || {});
    const usersArray = Object.values(users || {});

    const pendingCompanies = companiesArray.filter(company => !company.isApproved);
    const pendingUsers = usersArray.filter(user => 
      (user.userType === 'company' || user.userType === 'institution') && !user.isApproved
    );

    const pendingApprovals = [
      ...pendingCompanies.map(company => ({
        id: company.id,
        companyName: company.companyName,
        email: company.email,
        industry: company.industry,
        location: company.location,
        type: 'company',
        createdAt: company.createdAt
      })),
      ...pendingUsers.map(user => ({
        id: user.id,
        companyName: user.companyName || user.institutionName,
        email: user.email,
        industry: user.industry || user.type,
        location: user.location,
        type: user.userType,
        createdAt: user.createdAt
      }))
    ];

    res.json(pendingApprovals);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Error fetching pending approvals' });
  }
});

// Approve company
app.put('/api/admin/companies/:companyId/approve', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const [companies, users] = await Promise.all([
      req.firebase.readData('companies'),
      req.firebase.readData('users')
    ]);

    // Update company in companies collection
    const company = companies[companyId];
    if (company) {
      company.isApproved = true;
      company.updatedAt = new Date().toISOString();
      await req.firebase.writeData(`companies/${companyId}`, company);
    }

    // Update user in users collection
    const user = Object.values(users || {}).find(u => 
      (u.companyName === company?.companyName || u.id === companyId) && u.userType === 'company'
    );
    if (user) {
      user.isApproved = true;
      user.updatedAt = new Date().toISOString();
      await req.firebase.writeData(`users/${user.id}`, user);
    }

    res.json({ message: 'Company approved successfully' });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({ message: 'Error approving company' });
  }
});

// Suspend company
app.put('/api/admin/companies/:companyId/suspend', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const [companies, users] = await Promise.all([
      req.firebase.readData('companies'),
      req.firebase.readData('users')
    ]);

    // Update company in companies collection
    const company = companies[companyId];
    if (company) {
      company.isApproved = false;
      company.updatedAt = new Date().toISOString();
      await req.firebase.writeData(`companies/${companyId}`, company);
    }

    // Update user in users collection
    const user = Object.values(users || {}).find(u => 
      (u.companyName === company?.companyName || u.id === companyId) && u.userType === 'company'
    );
    if (user) {
      user.isApproved = false;
      user.updatedAt = new Date().toISOString();
      await req.firebase.writeData(`users/${user.id}`, user);
    }

    res.json({ message: 'Company suspended successfully' });
  } catch (error) {
    console.error('Error suspending company:', error);
    res.status(500).json({ message: 'Error suspending company' });
  }
});

// Approve institution
app.put('/api/admin/institutions/:institutionId/approve', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    const users = await req.firebase.readData('users');
    const user = Object.values(users || {}).find(u => 
      u.id === institutionId && u.userType === 'institution'
    );

    if (user) {
      user.isApproved = true;
      user.updatedAt = new Date().toISOString();
      await req.firebase.writeData(`users/${user.id}`, user);
    }

    res.json({ message: 'Institution approved successfully' });
  } catch (error) {
    console.error('Error approving institution:', error);
    res.status(500).json({ message: 'Error approving institution' });
  }
});

// Suspend institution
app.put('/api/admin/institutions/:institutionId/suspend', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    const users = await req.firebase.readData('users');
    const user = Object.values(users || {}).find(u => 
      u.id === institutionId && u.userType === 'institution'
    );

    if (user) {
      user.isApproved = false;
      user.updatedAt = new Date().toISOString();
      await req.firebase.writeData(`users/${user.id}`, user);
    }

    res.json({ message: 'Institution suspended successfully' });
  } catch (error) {
    console.error('Error suspending institution:', error);
    res.status(500).json({ message: 'Error suspending institution' });
  }
});

// Delete company
app.delete('/api/admin/companies/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    await req.firebase.deleteData(`companies/${companyId}`);
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Error deleting company' });
  }
});

// Delete institution
app.delete('/api/admin/institutions/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    await req.firebase.deleteData(`institutions/${institutionId}`);
    
    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({ message: 'Error deleting institution' });
  }
});

// Delete user
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await req.firebase.deleteData(`users/${userId}`);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ==================== COMPANY ROUTES ====================

// Post a new job
app.post('/api/company/jobs', async (req, res) => {
  try {
    const jobData = req.body;
    
    if (!jobData.companyId || !jobData.title || !jobData.description || !jobData.location) {
      return res.status(400).json({ message: 'Company ID, title, description, and location are required' });
    }

    const jobId = `job-${Date.now()}`;
    const newJob = {
      id: jobId,
      ...jobData,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      applicants: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`jobs/${jobId}`, newJob);

    res.status(201).json({
      message: 'Job posted successfully',
      jobId: jobId,
      job: newJob
    });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error posting job' });
  }
});

// Get company jobs
app.get('/api/company/jobs/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const jobs = await req.firebase.readData('jobs');
    const jobsArray = Object.values(jobs || {});
    const companyJobs = jobsArray.filter(job => job.companyId === companyId);
    res.json(companyJobs);
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({ message: 'Error fetching company jobs' });
  }
});

// Get company applications
app.get('/api/company/applications/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const [applications, jobs] = await Promise.all([
      req.firebase.readData('jobApplications'),
      req.firebase.readData('jobs')
    ]);

    const applicationsArray = Object.values(applications || {});
    const jobsArray = Object.values(jobs || {});
    
    const companyJobIds = jobsArray
      .filter(job => job.companyId === companyId)
      .map(job => job.id);

    const companyApplications = applicationsArray.filter(app => 
      companyJobIds.includes(app.jobId)
    );

    res.json(companyApplications);
  } catch (error) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({ message: 'Error fetching company applications' });
  }
});

// Update job application status
app.put('/api/company/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;
    
    const application = await req.firebase.readData(`jobApplications/${applicationId}`);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updatedApplication = {
      ...application,
      status,
      feedback: feedback || '',
      updatedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`jobApplications/${applicationId}`, updatedApplication);

    res.json({ 
      message: `Application ${status} successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

// Get company profile
app.get('/api/company/profile/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const [companies, users] = await Promise.all([
      req.firebase.readData('companies'),
      req.firebase.readData('users')
    ]);

    const company = companies[companyId];
    const user = Object.values(users || {}).find(u => u.id === companyId && u.userType === 'company');

    if (!company && !user) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const profile = {
      name: company?.companyName || user?.companyName || '',
      industry: company?.industry || user?.industry || '',
      description: company?.description || user?.description || '',
      contactEmail: company?.email || user?.email || '',
      phone: company?.phone || '',
      address: company?.location || user?.location || '',
      website: company?.website || ''
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Error fetching company profile' });
  }
});

// Update company profile
app.put('/api/company/profile/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const profileData = req.body;
    
    const companies = await req.firebase.readData('companies');
    const company = companies[companyId];

    if (company) {
      const updatedCompany = {
        ...company,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      await req.firebase.writeData(`companies/${companyId}`, updatedCompany);
    }

    res.json({ message: 'Company profile updated successfully' });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Error updating company profile' });
  }
});

// Update job
app.put('/api/company/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;
    
    const existingJob = await req.firebase.readData(`jobs/${jobId}`);
    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updatedJob = {
      ...existingJob,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`jobs/${jobId}`, updatedJob);

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Delete job
app.delete('/api/company/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const existingJob = await req.firebase.readData(`jobs/${jobId}`);
    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await req.firebase.deleteData(`jobs/${jobId}`);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// ==================== GRADUATE/JOB ROUTES ====================

// Get all active jobs for graduates and public viewing
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await req.firebase.readData('jobs');
    const jobsArray = Object.values(jobs || {});
    
    // Filter only active jobs and include company details
    const activeJobs = jobsArray.filter(job => job.status === 'active');
    
    // Get companies data to enrich job listings
    const companies = await req.firebase.readData('companies');
    const companiesArray = Object.values(companies || {});
    
    const enrichedJobs = activeJobs.map(job => {
      const company = companiesArray.find(comp => comp.id === job.companyId);
      return {
        ...job,
        companyIndustry: company?.industry,
        companyDescription: company?.description,
        companyEmail: company?.email
      };
    });

    res.json(enrichedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get jobs for graduate dashboard (same as public but with authentication)
app.get('/api/graduate/jobs', async (req, res) => {
  try {
    const jobs = await req.firebase.readData('jobs');
    const jobsArray = Object.values(jobs || {});
    
    const activeJobs = jobsArray.filter(job => job.status === 'active');
    
    const companies = await req.firebase.readData('companies');
    const companiesArray = Object.values(companies || {});
    
    const enrichedJobs = activeJobs.map(job => {
      const company = companiesArray.find(comp => comp.id === job.companyId);
      return {
        ...job,
        companyIndustry: company?.industry,
        companyDescription: company?.description,
        companyEmail: company?.email
      };
    });

    res.json(enrichedJobs);
  } catch (error) {
    console.error('Error fetching graduate jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get qualified jobs for a specific student based on their profile
app.get('/api/graduate/qualified-jobs/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [jobs, transcripts, users] = await Promise.all([
      req.firebase.readData('jobs'),
      req.firebase.readData('transcripts'),
      req.firebase.readData('users')
    ]);

    const jobsArray = Object.values(jobs || {});
    const transcriptsArray = Object.values(transcripts || {});
    const usersArray = Object.values(users || {});
    
    const student = usersArray.find(u => u.id === studentId);
    const studentTranscripts = transcriptsArray.filter(t => t.studentId === studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Use the most recent transcript for analysis
    const latestTranscript = studentTranscripts.reduce((latest, current) => {
      return new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest;
    }, { analysis: { gpa: 3.0, level: 'undergraduate' } });

    const analysis = latestTranscript.analysis || { gpa: 3.0, level: 'undergraduate' };

    // Filter and score jobs based on student profile
    const qualifiedJobs = jobsArray.filter(job => {
      if (job.status !== 'active') return false;
      
      // Check GPA requirement
      if (job.minGPA && analysis.gpa < parseFloat(job.minGPA)) {
        return false;
      }
      
      // Check experience requirement
      if (job.requiredExperience && analysis.experience < parseInt(job.requiredExperience)) {
        return false;
      }
      
      return true;
    }).map(job => {
      // Calculate match score
      let score = 0;
      
      // GPA match (40 points)
      if (job.minGPA) {
        const requiredGPA = parseFloat(job.minGPA);
        if (analysis.gpa >= requiredGPA + 0.5) score += 40;
        else if (analysis.gpa >= requiredGPA) score += 30;
        else score += 20;
      } else {
        score += 30;
      }
      
      // Experience match (30 points)
      if (job.requiredExperience) {
        const requiredExp = parseInt(job.requiredExperience);
        if (analysis.experience >= requiredExp + 1) score += 30;
        else if (analysis.experience >= requiredExp) score += 25;
        else score += 15;
      } else {
        score += 25;
      }
      
      // Education level (30 points)
      if (analysis.level === 'undergraduate' || analysis.level === 'postgraduate') {
        score += 30;
      } else {
        score += 20;
      }
      
      return {
        ...job,
        matchScore: Math.min(100, score)
      };
    });

    // Sort by match score
    qualifiedJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Get companies data
    const companies = await req.firebase.readData('companies');
    const companiesArray = Object.values(companies || {});

    const enrichedJobs = qualifiedJobs.map(job => {
      const company = companiesArray.find(comp => comp.id === job.companyId);
      return {
        ...job,
        companyIndustry: company?.industry,
        companyDescription: company?.description,
        companyEmail: company?.email
      };
    });

    res.json({
      qualifiedJobs: enrichedJobs,
      totalJobs: jobsArray.length,
      qualifiedCount: enrichedJobs.length
    });
  } catch (error) {
    console.error('Error fetching qualified jobs:', error);
    res.status(500).json({ message: 'Error fetching qualified jobs' });
  }
});

// Apply for a job
app.post('/api/graduate/apply-job', async (req, res) => {
  try {
    const { studentId, jobId, coverLetter } = req.body;

    if (!studentId || !jobId) {
      return res.status(400).json({ message: 'Student ID and Job ID are required' });
    }

    const [jobs, users, jobApplications] = await Promise.all([
      req.firebase.readData('jobs'),
      req.firebase.readData('users'),
      req.firebase.readData('jobApplications')
    ]);

    const job = jobs[jobId];
    const student = users[studentId];
    const applicationsArray = Object.values(jobApplications || {});

    if (!job || !student) {
      return res.status(404).json({ message: 'Job or student not found' });
    }

    // Check if already applied
    const existingApplication = applicationsArray.find(app => 
      app.studentId === studentId && app.jobId === jobId
    );

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for this job' 
      });
    }

    const applicationId = `job-app-${Date.now()}`;
    const newApplication = {
      id: applicationId,
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      jobId,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      coverLetter: coverLetter || '',
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    // Update job applicants count
    const updatedJob = {
      ...job,
      applicants: (job.applicants || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    await Promise.all([
      req.firebase.writeData(`jobApplications/${applicationId}`, newApplication),
      req.firebase.writeData(`jobs/${jobId}`, updatedJob)
    ]);

    res.json({
      message: 'Job application submitted successfully',
      applicationId: newApplication.id
    });
  } catch (error) {
    console.error('Error submitting job application:', error);
    res.status(500).json({ message: 'Error submitting job application' });
  }
});

// Get student's job applications
app.get('/api/graduate/applications/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const applications = await req.firebase.readData('jobApplications');
    const applicationsArray = Object.values(applications || {});
    const studentApplications = applicationsArray.filter(app => app.studentId === studentId);
    res.json(studentApplications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Error fetching job applications' });
  }
});

// ==================== STUDENT ROUTES ====================

// Upload transcript with PDF analysis
app.post('/api/student/upload-transcript', async (req, res) => {
  try {
    const { studentId, studentType, fileName, fileData } = req.body;

    if (!studentId || !fileName || !fileData) {
      return res.status(400).json({ message: 'Student ID, file name, and file data are required' });
    }

    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ 
        message: 'Only PDF files are allowed for transcripts' 
      });
    }

    console.log('Starting PDF analysis for student:', studentId);
    
    const analysis = await analyzeTranscript(fileData);
    
    const transcriptId = `transcript-${Date.now()}`;
    const newTranscript = {
      id: transcriptId,
      studentId,
      studentType: studentType || 'highschool',
      fileName,
      fileData,
      fileType: 'pdf',
      status: 'verified',
      analysis: analysis,
      uploadedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`transcripts/${transcriptId}`, newTranscript);

    res.json({
      message: 'Transcript uploaded and analyzed successfully',
      transcriptId: newTranscript.id,
      analysis: analysis
    });
  } catch (error) {
    console.error('Error uploading transcript:', error);
    res.status(500).json({ message: 'Error uploading transcript' });
  }
});

// Get student transcripts
app.get('/api/student/transcripts/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const transcripts = await req.firebase.readData('transcripts');
    const transcriptsArray = Object.values(transcripts || {});
    const studentTranscripts = transcriptsArray.filter(t => t.studentId === studentId);
    res.json(studentTranscripts);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ message: 'Error fetching transcripts' });
  }
});

// Get qualified courses based on transcript analysis
app.get('/api/student/qualified-courses/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [transcripts, courses, users] = await Promise.all([
      req.firebase.readData('transcripts'),
      req.firebase.readData('courses'),
      req.firebase.readData('users')
    ]);

    const transcriptsArray = Object.values(transcripts || {});
    const coursesArray = Object.values(courses || {});
    const usersArray = Object.values(users || {});
    
    const studentTranscripts = transcriptsArray.filter(t => t.studentId === studentId);
    const student = usersArray.find(u => u.id === studentId);

    if (studentTranscripts.length === 0) {
      return res.status(400).json({ 
        message: 'No transcripts found. Please upload your transcripts first.' 
      });
    }

    const latestTranscript = studentTranscripts.reduce((latest, current) => {
      return new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest;
    });

    if (!latestTranscript.analysis) {
      return res.status(400).json({ 
        message: 'Transcript analysis not available. Please re-upload your transcript.' 
      });
    }

    console.log('Finding qualified courses for analysis:', latestTranscript.analysis);
    
    const qualifiedCourses = coursesArray.filter(course => {
      const qualified = qualifiesForCourse(latestTranscript.analysis, course);
      console.log(`Course ${course.name}: ${qualified ? 'QUALIFIED' : 'NOT QUALIFIED'}`);
      return qualified;
    });

    console.log(`Found ${qualifiedCourses.length} qualified courses out of ${coursesArray.length} total courses`);

    const enrichedCourses = qualifiedCourses.map(course => {
      const institution = Object.values(usersArray).find(inst => inst.id === course.institutionId);
      const matchScore = calculateMatchScore(latestTranscript.analysis, course);
      
      return {
        ...course,
        institutionName: institution ? institution.name : 'Unknown Institution',
        matchScore: matchScore
      };
    });

    enrichedCourses.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      qualifiedCourses: enrichedCourses,
      transcriptAnalysis: latestTranscript.analysis,
      totalCourses: coursesArray.length,
      qualifiedCount: enrichedCourses.length
    });
  } catch (error) {
    console.error('Error fetching qualified courses:', error);
    res.status(500).json({ message: 'Error fetching qualified courses' });
  }
});

// Delete transcript
app.delete('/api/student/transcripts/:transcriptId', async (req, res) => {
  try {
    const { transcriptId } = req.params;
    
    const existingTranscript = await req.firebase.readData(`transcripts/${transcriptId}`);
    if (!existingTranscript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    await req.firebase.deleteData(`transcripts/${transcriptId}`);

    res.json({ message: 'Transcript deleted successfully' });
  } catch (error) {
    console.error('Error deleting transcript:', error);
    res.status(500).json({ message: 'Error deleting transcript' });
  }
});

// Apply for course
app.post('/api/student/apply-course', async (req, res) => {
  try {
    const { studentId, courseId, institutionId, personalStatement } = req.body;

    if (!studentId || !courseId || !institutionId) {
      return res.status(400).json({ message: 'Student ID, course ID, and institution ID are required' });
    }

    const [transcripts, applications, courses, users] = await Promise.all([
      req.firebase.readData('transcripts'),
      req.firebase.readData('applications'),
      req.firebase.readData('courses'),
      req.firebase.readData('users')
    ]);

    const transcriptsArray = Object.values(transcripts || {});
    const studentTranscripts = transcriptsArray.filter(t => t.studentId === studentId);
    
    if (studentTranscripts.length === 0) {
      return res.status(400).json({ 
        message: 'Please upload your transcripts before applying for courses' 
      });
    }

    const applicationsArray = Object.values(applications || {});
    const studentApplications = applicationsArray.filter(app => 
      app.studentId === studentId && app.institutionId === institutionId
    );

    if (studentApplications.length >= 2) {
      return res.status(400).json({ 
        message: 'You can only apply for maximum 2 courses per institution' 
      });
    }

    const existingApplication = applicationsArray.find(app => 
      app.studentId === studentId && app.courseId === courseId
    );

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for this course' 
      });
    }

    const coursesArray = Object.values(courses || {});
    const course = coursesArray.find(c => c.id === courseId);
    const usersArray = Object.values(users || {});
    const student = usersArray.find(u => u.id === studentId);

    if (!course || !student) {
      return res.status(404).json({ message: 'Course or student not found' });
    }

    const applicationId = `app-${Date.now()}`;
    const newApplication = {
      id: applicationId,
      studentId,
      studentName: student.name,
      courseId,
      courseName: course.name,
      institutionId,
      institutionName: course.institutionName,
      personalStatement: personalStatement || '',
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`applications/${applicationId}`, newApplication);

    res.json({
      message: 'Application submitted successfully',
      applicationId: newApplication.id
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
});

// Get student applications
app.get('/api/student/applications/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const applications = await req.firebase.readData('applications');
    const applicationsArray = Object.values(applications || {});
    const studentApplications = applicationsArray.filter(app => app.studentId === studentId);
    res.json(studentApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// ==================== INSTITUTION ROUTES ====================

// Get institution courses
app.get('/api/institution/courses/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const courses = await req.firebase.readData('courses');
    const coursesArray = Object.values(courses || {});
    const institutionCourses = coursesArray.filter(course => course.institutionId === institutionId);
    res.json(institutionCourses);
  } catch (error) {
    console.error('Error fetching institution courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Add new course
app.post('/api/institution/courses', async (req, res) => {
  try {
    const { name, faculty, credits, fees, duration, level, requirements, description, institutionId, institutionName } = req.body;
    
    if (!name || !faculty || !credits || !fees || !duration || !level || !institutionId || !institutionName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const courseId = `course-${Date.now()}`;
    const newCourse = {
      id: courseId,
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

    await req.firebase.writeData(`courses/${courseId}`, newCourse);

    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
});

// Update course
app.put('/api/institution/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    
    const existingCourse = await req.firebase.readData(`courses/${courseId}`);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const updatedCourse = {
      ...existingCourse,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`courses/${courseId}`, updatedCourse);

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// Delete course
app.delete('/api/institution/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const existingCourse = await req.firebase.readData(`courses/${courseId}`);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await req.firebase.deleteData(`courses/${courseId}`);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

// Get institution applications
app.get('/api/institution/applications/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    const [applications, courses, users] = await Promise.all([
      req.firebase.readData('applications'),
      req.firebase.readData('courses'),
      req.firebase.readData('users')
    ]);

    const applicationsArray = Object.values(applications || {});
    const coursesArray = Object.values(courses || {});
    const usersArray = Object.values(users || {});

    const institutionCourses = coursesArray.filter(course => course.institutionId === institutionId);
    const courseIds = institutionCourses.map(course => course.id);
    
    const institutionApplications = applicationsArray.filter(app => courseIds.includes(app.courseId));
    
    const enrichedApplications = institutionApplications.map(app => {
      const student = usersArray.find(user => user.id === app.studentId);
      const course = coursesArray.find(c => c.id === app.courseId);
      
      return {
        ...app,
        studentName: student ? student.name : 'Unknown Student',
        studentEmail: student ? student.email : '',
        courseName: course ? course.name : 'Unknown Course'
      };
    });

    res.json(enrichedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update application status
app.put('/api/institution/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;
    
    const application = await req.firebase.readData(`applications/${applicationId}`);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updatedApplication = {
      ...application,
      status,
      feedback: feedback || '',
      updatedAt: new Date().toISOString()
    };

    await req.firebase.writeData(`applications/${applicationId}`, updatedApplication);

    res.json({ 
      message: `Application ${status} successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

// ==================== BASIC ROUTES ====================

// Get universities
app.get('/api/universities', async (req, res) => {
  try {
    const institutions = await req.firebase.readData('institutions');
    const institutionsArray = Object.values(institutions || {});
    res.json(institutionsArray);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching universities' });
  }
});

// Get courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await req.firebase.readData('courses');
    const coursesArray = Object.values(courses || {});
    res.json(coursesArray);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Get undergraduate courses
app.get('/api/undergraduate/courses', async (req, res) => {
  try {
    const courses = await req.firebase.readData('courses');
    const coursesArray = Object.values(courses || {});
    const undergraduateCourses = coursesArray.filter(course => 
      course.level === 'undergraduate' || !course.level
    );
    res.json(undergraduateCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching undergraduate courses' });
  }
});

// Get companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await req.firebase.readData('companies');
    const companiesArray = Object.values(companies || {});
    const approvedCompanies = companiesArray.filter(company => company.isApproved);
    res.json(approvedCompanies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const data = await req.firebase.readData();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Firebase Realtime Database',
      platform: 'Career Guidance Platform Backend',
      version: '1.0.0',
      dataCounts: {
        users: Object.keys(data.users || {}).length,
        institutions: Object.keys(data.institutions || {}).length,
        courses: Object.keys(data.courses || {}).length,
        applications: Object.keys(data.applications || {}).length,
        companies: Object.keys(data.companies || {}).length,
        transcripts: Object.keys(data.transcripts || {}).length,
        jobs: Object.keys(data.jobs || {}).length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'operational'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Career Guidance Platform API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      student: '/api/student',
      institution: '/api/institution',
      company: '/api/company',
      universities: '/api/universities',
      companies: '/api/companies',
      courses: '/api/courses',
      health: '/api/health',
      test: '/api/test'
    },
    testCredentials: {
      admin: { email: 'admin@careerguide.ls', password: 'admin123' }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Initialize and start server
initializeSampleData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Jobs API: http://localhost:${PORT}/api/jobs`);
  });
});