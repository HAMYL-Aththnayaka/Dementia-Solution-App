// src/screens/caregiver/SafeZoneEditorScreen.js
// Caregiver views and creates safe zones on a map

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Modal, ScrollView, RefreshControl,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useApp } from '../../context/AppContext';
import { zonesApi } from '../../services/api';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import BigButton from '../../components/BigButton';
import AlertBanner from '../../components/AlertBanner';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SafeZoneEditorScreen() {
  const { zones, loadingZones, loadZones } = useApp();

  const [patientId, setPatientId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('200');
  const [mapCenter, setMapCenter] = useState({ latitude: 51.5074, longitude: -0.1278 }); // default London
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  function resetForm() {
    setZoneName('');
    setCenterLat('');
    setCenterLng('');
    setRadiusMeters('200');
    setError('');
  }

  async function handleSave() {
    const lat = parseFloat(centerLat);
    const lng = parseFloat(centerLng);
    const radius = parseInt(radiusMeters, 10);

    if (!zoneName.trim()) { setError('Zone name is required'); return; }
    if (isNaN(lat) || isNaN(lng)) { setError('Please enter valid coordinates'); return; }
    if (!patientId.trim()) { setError('Please enter the patient ID first'); return; }

    setSaving(true);
    setError('');
    try {
      await zonesApi.create(patientId.trim(), {
        name: zoneName.trim(),
        centerLat: lat,
        centerLng: lng,
        radiusMeters: isNaN(radius) ? 200 : radius,
      });
      setSuccess(`Zone "${zoneName}" created`);
      setShowModal(false);
      resetForm();
      await loadZones(patientId.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create zone');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(zoneId) {
    try {
      await zonesApi.delete(zoneId);
      await loadZones(patientId.trim());
    } catch {
      setError('Could not delete zone');
    }
  }

  async function handleLoadZones() {
    if (!patientId.trim()) return;
    await loadZones(patientId.trim()).catch(() => setError('Could not load zones'));
  }

  // User taps the map to set zone center
  function onMapPress(e) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCenterLat(latitude.toFixed(6));
    setCenterLng(longitude.toFixed(6));
  }

  const onRefresh = useCallback(async () => {
    if (!patientId.trim()) return;
    setRefreshing(true);
    await loadZones(patientId.trim()).catch(() => {});
    setRefreshing(false);
  }, [patientId]);

  const firstZone = zones[0];
  const mapRegion = firstZone
    ? { latitude: firstZone.centerLat, longitude: firstZone.centerLng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { ...mapCenter, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Safe Zones</Text>
        <Text style={styles.subtitle}>Define where the patient can safely be</Text>
      </View>

      <View style={styles.body}>
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
        <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} />

        {/* Patient ID */}
        <View style={styles.pidRow}>
          <TextInput
            style={styles.pidInput}
            placeholder="Patient ID"
            placeholderTextColor={colors.textMuted}
            value={patientId}
            onChangeText={setPatientId}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loadBtn} onPress={handleLoadZones}>
            <Text style={styles.loadBtnText}>Load</Text>
          </TouchableOpacity>
        </View>

        {/* Mini map showing zones */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={mapRegion} showsUserLocation>
            {zones.map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={{ latitude: zone.centerLat, longitude: zone.centerLng }}
                  radius={zone.radiusMeters}
                  fillColor={colors.primary + '30'}
                  strokeColor={colors.primary}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: zone.centerLat, longitude: zone.centerLng }}
                  title={zone.name}
                  description={`Radius: ${zone.radiusMeters}m`}
                />
              </React.Fragment>
            ))}
          </MapView>
        </View>

        {patientId.trim() !== '' && (
          <TouchableOpacity style={[styles.addBtn, shadows.sm]} onPress={() => { resetForm(); setShowModal(true); }}>
            <Text style={styles.addBtnText}>+ Add Safe Zone</Text>
          </TouchableOpacity>
        )}

        {loadingZones && !refreshing ? (
          <LoadingSpinner message="Loading zones..." />
        ) : (
          <FlatList
            data={zones}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.zoneCard, shadows.sm]}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{item.name}</Text>
                  <Text style={styles.zoneDetail}>
                    Radius: {item.radiusMeters}m · {item.centerLat.toFixed(4)}, {item.centerLng.toFixed(4)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              patientId.trim() ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>🗺️</Text>
                  <Text style={styles.emptyText}>No zones set up yet</Text>
                </View>
              ) : null
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {/* Add zone modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Safe Zone</Text>

            <AlertBanner type="error" message={error} onDismiss={() => setError('')} />

            <Text style={styles.label}>Zone Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Home Area" placeholderTextColor={colors.textMuted} value={zoneName} onChangeText={setZoneName} autoCapitalize="words" />

            <Text style={styles.label}>Centre Latitude</Text>
            <TextInput style={styles.input} placeholder="e.g. 51.507400" placeholderTextColor={colors.textMuted} value={centerLat} onChangeText={setCenterLat} keyboardType="decimal-pad" />

            <Text style={styles.label}>Centre Longitude</Text>
            <TextInput style={styles.input} placeholder="e.g. -0.127800" placeholderTextColor={colors.textMuted} value={centerLng} onChangeText={setCenterLng} keyboardType="decimal-pad" />

            <Text style={styles.label}>Radius (metres)</Text>
            <TextInput style={styles.input} placeholder="200" placeholderTextColor={colors.textMuted} value={radiusMeters} onChangeText={setRadiusMeters} keyboardType="numeric" />

            {/* Map to tap for coordinates */}
            <Text style={styles.label}>Or tap the map to set centre</Text>
            <View style={styles.modalMapContainer}>
              <MapView
                style={styles.modalMap}
                initialRegion={{ latitude: 51.5074, longitude: -0.1278, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                onPress={onMapPress}
              >
                {centerLat && centerLng && !isNaN(parseFloat(centerLat)) && (
                  <>
                    <Circle
                      center={{ latitude: parseFloat(centerLat), longitude: parseFloat(centerLng) }}
                      radius={parseInt(radiusMeters, 10) || 200}
                      fillColor={colors.primary + '30'}
                      strokeColor={colors.primary}
                      strokeWidth={2}
                    />
                    <Marker coordinate={{ latitude: parseFloat(centerLat), longitude: parseFloat(centerLng) }} />
                  </>
                )}
              </MapView>
            </View>

            <BigButton title="Save Zone" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
            <BigButton title="Cancel" onPress={() => { setShowModal(false); resetForm(); }} variant="secondary" style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.textPrimary },
  subtitle: { fontSize: fonts.md, color: colors.textSecondary, marginTop: spacing.xs },
  body: { flex: 1, padding: spacing.lg },
  pidRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  pidInput: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary, backgroundColor: colors.surface },
  loadBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  loadBtnText: { color: '#fff', fontSize: fonts.md, fontWeight: fonts.bold },
  mapContainer: { height: 180, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  map: { flex: 1 },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  addBtnText: { color: '#fff', fontSize: fonts.lg, fontWeight: fonts.bold },
  list: { paddingBottom: spacing.xl },
  zoneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: fonts.lg, fontWeight: fonts.semibold, color: colors.textPrimary },
  zoneDetail: { fontSize: fonts.sm, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  deleteText: { fontSize: 20 },
  empty: { alignItems: 'center', paddingTop: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.lg, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '95%' },
  modalContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  modalTitle: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.textPrimary, marginBottom: spacing.xl },
  label: { fontSize: fonts.md, fontWeight: fonts.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary, backgroundColor: colors.background, marginBottom: spacing.md },
  modalMapContainer: { height: 200, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  modalMap: { flex: 1 },
});
