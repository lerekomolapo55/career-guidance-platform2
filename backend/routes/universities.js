const express = require('express');
const router = express.Router();

// Get all institutions (universities)
router.get('/', (req, res) => {
  try {
    const data = req.storage.readData();
    res.json(data.institutions);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ message: 'Error fetching universities' });
  }
});

// Get institution by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.storage.readData();
    
    const institution = data.institutions.find(inst => inst.id === id);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }
    
    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institution' });
  }
});

// Search institutions
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();
    const data = req.storage.readData();
    
    const results = data.institutions.filter(institution => 
      institution.name.toLowerCase().includes(searchTerm) ||
      institution.location.toLowerCase().includes(searchTerm) ||
      (institution.description && institution.description.toLowerCase().includes(searchTerm))
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching institutions' });
  }
});

// Get institutions by type
router.get('/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const data = req.storage.readData();
    
    const institutions = data.institutions.filter(inst => inst.type === type);
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institutions by type' });
  }
});

module.exports = router;