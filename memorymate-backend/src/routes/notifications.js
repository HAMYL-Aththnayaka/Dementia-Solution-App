// src/routes/notifications.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');

// GET /caregivers/:id/notifications
router.get('/:id/notifications', authenticate, getNotifications);
// PATCH /caregivers/:id/notifications/read-all
router.patch('/:id/notifications/read-all', authenticate, markAllRead);

module.exports = router;
