// src/index.js
// Entry point for the MemoryMate backend API

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/auth');

// Individual route + controller imports
const authRoutes = require('./routes/auth');

// Controllers used directly (simpler flat route setup)
const { getPatient, getPatientCaregivers } = require('./controllers/patientController');
const { getFaces, createFace, updateFace, deleteFace, matchFace } = require('./controllers/faceController');
const { getRoutines, createRoutine, updateRoutine, deleteRoutine, logRoutine, getRoutineLogs } = require('./controllers/routineController');
const { getZones, createZone, updateZone, deleteZone, reportZoneEvent } = require('./controllers/zoneController');
const { getActivityLog } = require('./controllers/activityController');
const { getNotifications, markRead, markAllRead } = require('./controllers/notificationController');

// Multer setup for face photo uploads
const multer = require('multer');
const uploadsDir = config.uploads.dir;
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP images allowed'));
    }
  },
});

// Services that run on startup
const { startReminderCron } = require('./services/cronService');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MemoryMate API', timestamp: new Date().toISOString() });
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// ─── Patient Routes ───────────────────────────────────────────────────────────
app.get('/patients/:id', authenticate, getPatient);
app.get('/patients/:id/caregivers', authenticate, getPatientCaregivers);

// ─── Face Routes ──────────────────────────────────────────────────────────────
app.get('/patients/:id/faces', authenticate, getFaces);
app.post('/patients/:id/faces', authenticate, upload.single('photo'), createFace);
app.post('/patients/:id/faces/match', authenticate, matchFace);
app.patch('/faces/:id', authenticate, updateFace);
app.delete('/faces/:id', authenticate, deleteFace);

// ─── Routine Routes ───────────────────────────────────────────────────────────
app.get('/patients/:id/routines', authenticate, getRoutines);
app.post('/patients/:id/routines', authenticate, createRoutine);
app.patch('/routines/:id', authenticate, updateRoutine);
app.delete('/routines/:id', authenticate, deleteRoutine);
app.post('/routines/:id/log', authenticate, logRoutine);
app.get('/routines/:id/logs', authenticate, getRoutineLogs);

// ─── Zone Routes ──────────────────────────────────────────────────────────────
app.get('/patients/:id/zones', authenticate, getZones);
app.post('/patients/:id/zones', authenticate, createZone);
app.patch('/zones/:id', authenticate, updateZone);
app.delete('/zones/:id', authenticate, deleteZone);
app.post('/zones/:id/event', authenticate, reportZoneEvent);

// ─── Activity Routes ──────────────────────────────────────────────────────────
app.get('/patients/:id/activity', authenticate, getActivityLog);

// ─── Notification Routes ──────────────────────────────────────────────────────
app.get('/caregivers/:id/notifications', authenticate, getNotifications);
app.patch('/caregivers/:id/notifications/read-all', authenticate, markAllRead);
app.patch('/notifications/:id/read', authenticate, markRead);

// ─── 404 + Error Handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n✅ MemoryMate API running on port ${config.port}`);
  console.log(`   Environment : ${config.nodeEnv}`);
  console.log(`   Health check: http://localhost:${config.port}/health\n`);
  startReminderCron();
});

module.exports = app;
