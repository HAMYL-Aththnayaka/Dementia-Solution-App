// src/routes/faces.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getFaces, createFace, updateFace, deleteFace, matchFace } = require('../controllers/faceController');
const config = require('../config');

// Ensure uploads directory exists
if (!fs.existsSync(config.uploads.dir)) {
  fs.mkdirSync(config.uploads.dir, { recursive: true });
}

// Multer config — store files locally in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploads.dir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// Routes that live under /patients/:id/faces are mounted by the main router
// NOTE: index.js mounts /patients routes; faces are accessed as /patients/:id/faces
// This file also handles /faces/:id operations mounted at /faces

// These are mounted at /patients in index.js — so path here is /:id/faces
router.get('/:id/faces', authenticate, getFaces);
router.post('/:id/faces', authenticate, upload.single('photo'), createFace);
router.post('/:id/faces/match', authenticate, matchFace);

module.exports = router;
