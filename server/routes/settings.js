const express = require('express');
const Settings = require('../models/Settings');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get system settings
router.get('/', auth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ id: 'default' });
    
    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = new Settings({ id: 'default' });
      await defaultSettings.save();
      return res.json({ settings: defaultSettings });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch settings' } });
  }
});

module.exports = router;







