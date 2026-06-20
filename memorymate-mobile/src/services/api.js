// src/services/api.js
// Axios instance pre-configured with base URL and auth header injection

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your backend URL when deploying
// For local dev with Expo on a physical device, use your machine's LAN IP
// e.g. http://192.168.1.100:3000
// For Android emulator: http://10.0.2.2:3000
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore might fail in web — silently skip
  }
  return config;
});

// Intercept 401 errors globally — token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored token so the app redirects to login
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  linkPatient: (inviteCode, relationship) =>
    api.post('/auth/link-patient', { inviteCode, relationship }),
  updateFcmToken: (fcmToken) => api.patch('/auth/fcm-token', { fcmToken }),
};

// ─── Faces ────────────────────────────────────────────────────────────────────
export const facesApi = {
  list: (patientId) => api.get(`/patients/${patientId}/faces`),
  create: (patientId, formData) =>
    api.post(`/patients/${patientId}/faces`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (faceId, data) => api.patch(`/faces/${faceId}`, data),
  delete: (faceId) => api.delete(`/faces/${faceId}`),
  match: (patientId, embeddingVector) =>
    api.post(`/patients/${patientId}/faces/match`, { embeddingVector }),
};

// ─── Routines ─────────────────────────────────────────────────────────────────
export const routinesApi = {
  list: (patientId) => api.get(`/patients/${patientId}/routines`),
  create: (patientId, data) => api.post(`/patients/${patientId}/routines`, data),
  update: (routineId, data) => api.patch(`/routines/${routineId}`, data),
  delete: (routineId) => api.delete(`/routines/${routineId}`),
  log: (routineId, status) => api.post(`/routines/${routineId}/log`, { status }),
  getLogs: (routineId) => api.get(`/routines/${routineId}/logs`),
};

// ─── Zones ────────────────────────────────────────────────────────────────────
export const zonesApi = {
  list: (patientId) => api.get(`/patients/${patientId}/zones`),
  create: (patientId, data) => api.post(`/patients/${patientId}/zones`, data),
  update: (zoneId, data) => api.patch(`/zones/${zoneId}`, data),
  delete: (zoneId) => api.delete(`/zones/${zoneId}`),
  reportEvent: (zoneId, eventType, lat, lng) =>
    api.post(`/zones/${zoneId}/event`, { eventType, lat, lng }),
};

// ─── Activity + Notifications ────────────────────────────────────────────────
export const activityApi = {
  list: (patientId, params) => api.get(`/patients/${patientId}/activity`, { params }),
};

export const notificationsApi = {
  list: (caregiverId) => api.get(`/caregivers/${caregiverId}/notifications`),
  markRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllRead: (caregiverId) => api.patch(`/caregivers/${caregiverId}/notifications/read-all`),
};
