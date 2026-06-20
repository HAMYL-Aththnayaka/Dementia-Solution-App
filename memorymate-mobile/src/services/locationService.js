// src/services/locationService.js
// Geofencing setup using expo-location OS-level APIs (battery-efficient)

import * as Location from 'expo-location';
import { zonesApi } from './api';

// Request location permissions (foreground + background)
export async function requestLocationPermissions() {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') {
    return { granted: false, reason: 'foreground_denied' };
  }

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') {
    // Foreground only — geofencing won't work in background but location will
    return { granted: true, backgroundGranted: false };
  }

  return { granted: true, backgroundGranted: true };
}

// Get current location once
export async function getCurrentLocation() {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return location.coords; // { latitude, longitude, accuracy }
}

// Start OS-level geofencing for a list of safe zones
// When the patient leaves or enters a zone, the callback fires
export async function startGeofencing(zones, onEvent) {
  if (!zones || zones.length === 0) return;

  const regions = zones.map((zone) => ({
    identifier: zone.id,
    latitude: zone.centerLat,
    longitude: zone.centerLng,
    radius: zone.radiusMeters,
    notifyOnEnter: true,
    notifyOnExit: true,
  }));

  await Location.startGeofencingAsync('geofence-task', regions);
  console.log(`✅ Geofencing started for ${zones.length} zone(s)`);
}

// Stop geofencing (call when patient logs out)
export async function stopGeofencing() {
  try {
    await Location.stopGeofencingAsync('geofence-task');
    console.log('Geofencing stopped');
  } catch {
    // May throw if not started
  }
}

// Report a zone event to the backend
// Called from the geofence background task
export async function reportZoneEvent(zoneId, eventType, latitude, longitude) {
  try {
    await zonesApi.reportEvent(zoneId, eventType, latitude, longitude);
    console.log(`Zone ${eventType} event reported for zone ${zoneId}`);
  } catch (err) {
    console.error('Failed to report zone event:', err.message);
    // TODO Phase 5: queue retry if offline
  }
}
