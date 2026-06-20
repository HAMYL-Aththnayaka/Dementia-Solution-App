// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { register, login, getMe, linkPatient, updateFcmToken } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/link-patient', authenticate, linkPatient);
router.patch('/fcm-token', authenticate, updateFcmToken);

module.exports = router;
