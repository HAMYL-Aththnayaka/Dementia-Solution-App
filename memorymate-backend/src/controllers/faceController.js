// src/controllers/faceController.js
// CRUD for known faces — caregivers upload photos for a patient

const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const { isLinkedOrSelf } = require('./patientController');

const prisma = new PrismaClient();

// GET /patients/:id/faces
async function getFaces(req, res, next) {
  try {
    const { id: patientId } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const faces = await prisma.knownFace.findMany({
      where: { patientId },
      select: {
        id: true,
        name: true,
        relationship: true,
        photoUrl: true,
        createdAt: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, faces);
  } catch (err) {
    next(err);
  }
}

// POST /patients/:id/faces
// Body: multipart/form-data with fields: name, relationship
// File: photo (image)
async function createFace(req, res, next) {
  try {
    const { id: patientId } = req.params;
    const { name, relationship } = req.body;

    if (!name || !relationship) {
      return errorResponse(res, 'name and relationship are required', 400);
    }

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    // Build the photo URL if a file was uploaded
    let photoUrl = null;
    if (req.file) {
      // Store a relative path — served as /uploads/<filename>
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // In Phase 1: store the photo. Embedding vector will be added in Phase 4.
    // The embeddingVector field is left null for now and filled when on-device
    // TFLite sends the computed vector back to the backend.
    const face = await prisma.knownFace.create({
      data: {
        patientId,
        createdById: req.user.id,
        name,
        relationship,
        photoUrl,
        embeddingVector: null, // populated later by mobile app
      },
    });

    // Log to activity
    await prisma.activityLog.create({
      data: {
        patientId,
        eventType: 'RECOGNITION',
        payload: JSON.stringify({ action: 'face_added', faceId: face.id, name }),
      },
    });

    return successResponse(res, face, 'Face added', 201);
  } catch (err) {
    next(err);
  }
}

// PATCH /faces/:id — update name or relationship
async function updateFace(req, res, next) {
  try {
    const { id } = req.params;
    const { name, relationship, embeddingVector } = req.body;

    const face = await prisma.knownFace.findUnique({ where: { id } });
    if (!face) return errorResponse(res, 'Face not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, face.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const updated = await prisma.knownFace.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(relationship && { relationship }),
        // embeddingVector sent as JSON string array from the mobile ML module
        ...(embeddingVector && {
          embeddingVector: typeof embeddingVector === 'string'
            ? embeddingVector
            : JSON.stringify(embeddingVector),
        }),
      },
    });

    return successResponse(res, updated, 'Face updated');
  } catch (err) {
    next(err);
  }
}

// DELETE /faces/:id
async function deleteFace(req, res, next) {
  try {
    const { id } = req.params;

    const face = await prisma.knownFace.findUnique({ where: { id } });
    if (!face) return errorResponse(res, 'Face not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, face.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    await prisma.knownFace.delete({ where: { id } });

    return successResponse(res, null, 'Face deleted');
  } catch (err) {
    next(err);
  }
}

// POST /patients/:id/faces/match
// Body: { embeddingVector: number[] }
// Returns the best matching face or null if below threshold
async function matchFace(req, res, next) {
  try {
    const { id: patientId } = req.params;
    const { embeddingVector } = req.body;

    if (!embeddingVector || !Array.isArray(embeddingVector)) {
      return errorResponse(res, 'embeddingVector (array) is required', 400);
    }

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    // Get all faces with stored embeddings for this patient
    const faces = await prisma.knownFace.findMany({
      where: { patientId, embeddingVector: { not: null } },
    });

    if (faces.length === 0) {
      return successResponse(res, { matched: false, reason: 'no_faces_enrolled' });
    }

    // Cosine similarity
    function cosineSimilarity(a, b) {
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    const MATCH_THRESHOLD = 0.6; // configurable
    let bestMatch = null;
    let bestScore = -1;

    for (const face of faces) {
      const stored = JSON.parse(face.embeddingVector);
      const score = cosineSimilarity(embeddingVector, stored);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = face;
      }
    }

    if (bestScore >= MATCH_THRESHOLD) {
      // Log recognition event
      await prisma.activityLog.create({
        data: {
          patientId,
          eventType: 'RECOGNITION',
          payload: JSON.stringify({
            action: 'face_matched',
            faceId: bestMatch.id,
            name: bestMatch.name,
            score: bestScore.toFixed(3),
          }),
        },
      });

      return successResponse(res, {
        matched: true,
        face: {
          id: bestMatch.id,
          name: bestMatch.name,
          relationship: bestMatch.relationship,
          photoUrl: bestMatch.photoUrl,
        },
        confidence: bestScore,
      });
    }

    return successResponse(res, { matched: false, reason: 'below_threshold', confidence: bestScore });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFaces, createFace, updateFace, deleteFace, matchFace };
