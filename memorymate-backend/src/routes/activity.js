// src/routes/activity.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getActivityLog } = require('../controllers/activityController');

// Mounted at /patients in index.js
router.get('/:id/activity', authenticate, getActivityLog);

module.exports = router;
