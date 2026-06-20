// src/routes/routines.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  logRoutine,
  getRoutineLogs,
} = require('../controllers/routineController');

// Mounted at /patients in index.js
router.get('/:id/routines', authenticate, getRoutines);
router.post('/:id/routines', authenticate, createRoutine);

module.exports = router;
