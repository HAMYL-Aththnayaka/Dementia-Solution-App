// src/ml/faceRecognition.js
// Face recognition placeholder
//
// Phase 1 (current): The mobile app uploads a photo to the backend and gets a match back.
// Phase 4: This file will load a TFLite MobileFaceNet model on-device,
//           compute an embedding from a camera frame, and call the backend /faces/match
//           endpoint with the embedding vector for comparison.
//
// This separation means Phase 1 is fully testable without any ML setup.

import { facesApi } from '../services/api';

// Compute cosine similarity between two float arrays
// Used in Phase 4 for on-device comparison
export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Phase 1: Upload photo to backend and get a match result
// photoUri — result from expo-camera or expo-image-picker
// patientId — whose face list to match against
export async function matchFaceViaBackend(patientId, photoUri) {
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    name: 'face.jpg',
    type: 'image/jpeg',
  });

  // In Phase 1, the backend doesn't do real matching (no ML).
  // It returns the list of known faces so the app can show "no match yet"
  // This endpoint will be upgraded when embeddings are populated.
  const res = await facesApi.list(patientId);
  const faces = res.data.data;

  if (faces.length === 0) {
    return { matched: false, reason: 'No faces enrolled yet' };
  }

  // Phase 1 placeholder — return first face as demo match
  // TODO Phase 4: Replace with real TFLite embedding + cosine match
  return {
    matched: true,
    face: faces[0],
    confidence: 0.85,
    isPlaceholder: true, // flag so UI can show "(demo mode)"
  };
}

// Phase 4 stub — will load TFLite model
export async function loadFaceModel() {
  // TODO Phase 4: Load MobileFaceNet TFLite model
  // const model = await tf.loadGraphModel('...');
  console.log('Face model loading: Phase 4 not yet implemented — using Phase 1 backend match');
  return null;
}

// Phase 4 stub — will compute embedding from a camera frame tensor
export async function computeEmbedding(model, imageTensor) {
  // TODO Phase 4: return Float32Array embedding
  console.log('computeEmbedding: Phase 4 not yet implemented');
  return null;
}
