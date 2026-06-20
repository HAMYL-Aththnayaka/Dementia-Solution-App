// src/utils/helpers.js
// Small utility functions used across the app

// Format a JS Date or ISO string to "Tuesday, 17 June 2026"
export function formatDate(date) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format to "08:30 AM"
export function formatTime(date) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Format "HH:MM" schedule string to "8:30 AM"
export function formatScheduleTime(timeStr) {
  if (!timeStr) return '';
  const [hh, mm] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(hh, 10), parseInt(mm, 10));
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Friendly relative time: "5 minutes ago", "2 hours ago"
export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Routine type label + emoji
export function routineTypeInfo(type) {
  const map = {
    MEDICATION: { label: 'Medication', emoji: '💊', color: '#FF6B6B' },
    MEAL: { label: 'Meal', emoji: '🍽️', color: '#FFA94D' },
    APPOINTMENT: { label: 'Appointment', emoji: '🏥', color: '#4DABF7' },
    OTHER: { label: 'Activity', emoji: '⭐', color: '#69DB7C' },
  };
  return map[type] || map.OTHER;
}

// Activity log event labels
export function activityEventInfo(eventType) {
  const map = {
    RECOGNITION: { label: 'Face Recognized', emoji: '👤', color: '#4A6FE3' },
    REMINDER: { label: 'Reminder', emoji: '⏰', color: '#F5A623' },
    ZONE_EVENT: { label: 'Zone Alert', emoji: '📍', color: '#FF3B30' },
    COMPANION_QUERY: { label: 'Companion', emoji: '💬', color: '#34C759' },
  };
  return map[eventType] || { label: eventType, emoji: '📋', color: '#9BA3C5' };
}

// Calculate distance in meters between two lat/lng points (Haversine)
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
