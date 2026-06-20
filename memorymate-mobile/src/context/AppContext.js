// src/context/AppContext.js
// Manages app-level data — faces, routines, zones, notifications
// Loaded per-role after login

import React, { createContext, useContext, useReducer } from 'react';
import { facesApi, routinesApi, zonesApi, activityApi, notificationsApi } from '../services/api';

const AppContext = createContext(null);

const initialState = {
  // Caregiver data (loaded for linked patient)
  faces: [],
  routines: [],
  zones: [],
  activityLog: [],
  notifications: [],
  unreadCount: 0,

  // Patient data
  linkedCaregivers: [],
  todayRoutines: [],     // routines scheduled for today
  currentZoneStatus: null, // 'INSIDE' | 'OUTSIDE' | null

  // Loading flags
  loadingFaces: false,
  loadingRoutines: false,
  loadingZones: false,
  loadingActivity: false,
  loadingNotifications: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_FACES': return { ...state, faces: action.data, loadingFaces: false };
    case 'SET_ROUTINES': return { ...state, routines: action.data, loadingRoutines: false };
    case 'SET_ZONES': return { ...state, zones: action.data, loadingZones: false };
    case 'SET_ACTIVITY': return { ...state, activityLog: action.data, loadingActivity: false };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.data,
        unreadCount: action.data.filter((n) => !n.isRead).length,
        loadingNotifications: false,
      };
    case 'SET_ZONE_STATUS': return { ...state, currentZoneStatus: action.status };
    case 'LOADING_FACES': return { ...state, loadingFaces: true };
    case 'LOADING_ROUTINES': return { ...state, loadingRoutines: true };
    case 'LOADING_ZONES': return { ...state, loadingZones: true };
    case 'LOADING_ACTIVITY': return { ...state, loadingActivity: true };
    case 'LOADING_NOTIFICATIONS': return { ...state, loadingNotifications: true };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ─── Faces ──────────────────────────────────────────────────────────────────
  async function loadFaces(patientId) {
    dispatch({ type: 'LOADING_FACES' });
    try {
      const res = await facesApi.list(patientId);
      dispatch({ type: 'SET_FACES', data: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_FACES', data: state.faces }); // keep old on error
      throw err;
    }
  }

  // ─── Routines ────────────────────────────────────────────────────────────────
  async function loadRoutines(patientId) {
    dispatch({ type: 'LOADING_ROUTINES' });
    try {
      const res = await routinesApi.list(patientId);
      dispatch({ type: 'SET_ROUTINES', data: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ROUTINES', data: state.routines });
      throw err;
    }
  }

  // ─── Zones ──────────────────────────────────────────────────────────────────
  async function loadZones(patientId) {
    dispatch({ type: 'LOADING_ZONES' });
    try {
      const res = await zonesApi.list(patientId);
      dispatch({ type: 'SET_ZONES', data: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ZONES', data: state.zones });
      throw err;
    }
  }

  // ─── Activity ────────────────────────────────────────────────────────────────
  async function loadActivity(patientId, params) {
    dispatch({ type: 'LOADING_ACTIVITY' });
    try {
      const res = await activityApi.list(patientId, params);
      dispatch({ type: 'SET_ACTIVITY', data: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ACTIVITY', data: state.activityLog });
      throw err;
    }
  }

  // ─── Notifications ────────────────────────────────────────────────────────────
  async function loadNotifications(caregiverId) {
    dispatch({ type: 'LOADING_NOTIFICATIONS' });
    try {
      const res = await notificationsApi.list(caregiverId);
      dispatch({ type: 'SET_NOTIFICATIONS', data: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_NOTIFICATIONS', data: state.notifications });
      throw err;
    }
  }

  async function markNotificationRead(id, caregiverId) {
    try {
      await notificationsApi.markRead(id);
      dispatch({ type: 'MARK_NOTIFICATION_READ', id });
    } catch {}
  }

  function setZoneStatus(status) {
    dispatch({ type: 'SET_ZONE_STATUS', status });
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        loadFaces,
        loadRoutines,
        loadZones,
        loadActivity,
        loadNotifications,
        markNotificationRead,
        setZoneStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
