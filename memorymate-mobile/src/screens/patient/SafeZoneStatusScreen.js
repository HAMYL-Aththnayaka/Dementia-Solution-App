// src/screens/patient/SafeZoneStatusScreen.js
// Shows whether the patient is inside or outside their safe zone(s)

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getCurrentLocation, requestLocationPermissions } from '../../services/locationService';
import { distanceMeters } from '../../utils/helpers';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';

export default function SafeZoneStatusScreen() {
  const { user } = useAuth();
  const { zones, loadZones } = useApp();
  const [checking, setChecking] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [zoneStatuses, setZoneStatuses] = useState([]); // [{ zone, status, distance }]

  useEffect(() => {
    if (user?.id) {
      loadZones(user.id).catch(() => {});
    }
  }, [user?.id]);

  async function checkLocation() {
    setChecking(true);
    setLocationError('');

    const { granted } = await requestLocationPermissions();
    if (!granted) {
      setLocationError('Location permission is needed to check your safe zone.');
      setChecking(false);
      return;
    }

    try {
      const coords = await getCurrentLocation();
      const statuses = zones.map((zone) => {
        const dist = distanceMeters(coords.latitude, coords.longitude, zone.centerLat, zone.centerLng);
        const inside = dist <= zone.radiusMeters;
        return { zone, inside, distanceMeters: Math.round(dist) };
      });
      setZoneStatuses(statuses);
    } catch (err) {
      setLocationError('Could not get your location. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  const allInside = zoneStatuses.length > 0 && zoneStatuses.every((s) => s.inside);
  const anyOutside = zoneStatuses.some((s) => !s.inside);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📍 Safety Status</Text>

      {zones.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyText}>No safe zones set up yet</Text>
          <Text style={styles.emptySub}>Ask your caregiver to draw a safe zone on the map.</Text>
        </View>
      ) : (
        <>
          {/* Big status indicator */}
          {zoneStatuses.length > 0 && (
            <View style={[styles.statusCard, anyOutside ? styles.outsideCard : styles.insideCard]}>
              <Text style={styles.statusEmoji}>{anyOutside ? '⚠️' : '✅'}</Text>
              <Text style={styles.statusText}>
                {anyOutside ? 'Outside Safe Zone' : 'You are safe'}
              </Text>
              {anyOutside && (
                <Text style={styles.statusSub}>
                  Your caregiver has been notified automatically.
                </Text>
              )}
            </View>
          )}

          {/* Zone list */}
          {zones.map((zone) => {
            const status = zoneStatuses.find((s) => s.zone.id === zone.id);
            return (
              <View key={zone.id} style={[styles.zoneCard, shadows.sm]}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneRadius}>Radius: {zone.radiusMeters}m</Text>
                {status && (
                  <Text style={[styles.zoneStatus, status.inside ? styles.textSafe : styles.textDanger]}>
                    {status.inside ? `✅ Inside (${status.distanceMeters}m from centre)` : `⚠️ Outside (${status.distanceMeters}m away)`}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Check location button */}
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={checkLocation}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkBtnText}>🔍  Check My Location</Text>
            )}
          </TouchableOpacity>

          {locationError ? (
            <Text style={styles.error}>{locationError}</Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.patientBackground },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.patientText, marginBottom: spacing.xl },

  emptyCard: {
    backgroundColor: colors.patientSurface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.xl, fontWeight: fonts.bold, color: colors.patientText, textAlign: 'center' },
  emptySub: { fontSize: fonts.md, color: colors.patientSubtext, textAlign: 'center', marginTop: spacing.sm },

  statusCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  insideCard: { backgroundColor: colors.success + '20', borderWidth: 2, borderColor: colors.success },
  outsideCard: { backgroundColor: colors.danger + '20', borderWidth: 2, borderColor: colors.danger },
  statusEmoji: { fontSize: 56 },
  statusText: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.patientText, marginTop: spacing.sm },
  statusSub: { fontSize: fonts.md, color: colors.patientSubtext, textAlign: 'center', marginTop: spacing.xs },

  zoneCard: {
    backgroundColor: colors.patientSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  zoneName: { fontSize: fonts.lg, fontWeight: fonts.bold, color: colors.patientText },
  zoneRadius: { fontSize: fonts.sm, color: colors.patientSubtext, marginTop: 2 },
  zoneStatus: { fontSize: fonts.md, fontWeight: fonts.semibold, marginTop: spacing.sm },
  textSafe: { color: colors.success },
  textDanger: { color: colors.danger },

  checkBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  checkBtnText: { color: '#fff', fontSize: fonts.xl, fontWeight: fonts.bold },
  error: { color: colors.danger, fontSize: fonts.md, textAlign: 'center', marginTop: spacing.md },
});
