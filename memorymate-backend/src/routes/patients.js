// src/routes/patients.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getPatient, getPatientCaregivers } = require('../controllers/patientController');

router.get('/:id', authenticate, getPatient);
router.get('/:id/caregivers', authenticate, getPatientCaregivers);

module.exports = router;
