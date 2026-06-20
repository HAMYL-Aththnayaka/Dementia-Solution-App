// src/routes/zones.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  reportZoneEvent,
} = require('../controllers/zoneController');

// Mounted at /patients in index.js
router.get('/:id/zones', authenticate, getZones);
router.post('/:id/zones', authenticate, createZone);

module.exports = router;
