// src/screens/caregiver/ManageFacesScreen.js
// Caregiver adds/removes known faces for the patient

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, RefreshControl, Modal, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { facesApi } from '../../services/api';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import FaceCard from '../../components/FaceCard';
import BigButton from '../../components/BigButton';
import AlertBanner from '../../components/AlertBanner';
import LoadingSpinner from '../../components/LoadingSpinner';

// Hardcoded patient ID for demo — in production this would come from the linked patient list
const DEMO_PATIENT_ID_KEY = 'linkedPatientId';

export default function ManageFacesScreen() {
  const { user } = useAuth();
  const { faces, loadingFaces, loadFaces } = useApp();

  const [patientId, setPatientId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // For demo: use DEMO patient. In real app: select from linked patients list
  useEffect(() => {
    fetchLinkedPatient();
  }, []);

  async function fetchLinkedPatient() {
    // Try to get patient ID from auth/me or previously stored
    // Simplified: user can type patient ID in field below
  }

  function resetForm() {
    setName('');
    setRelationship('');
    setPhoto(null);
    setError('');
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Photo library permission is needed');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  }

  async function handleSave() {
    if (!name.trim() || !relationship.trim()) {
      setError('Name and relationship are required');
      return;
    }
    if (!patientId.trim()) {
      setError('Please enter the patient ID first');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('relationship', relationship.trim());
      if (photo) {
        formData.append('photo', {
          uri: photo.uri,
          name: 'face.jpg',
          type: 'image/jpeg',
        });
      }
      await facesApi.create(patientId.trim(), formData);
      setSuccess(`${name} added successfully!`);
      setShowModal(false);
      resetForm();
      await loadFaces(patientId.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add face. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(faceId) {
    try {
      await facesApi.delete(faceId);
      await loadFaces(patientId.trim());
    } catch {
      setError('Could not delete face.');
    }
  }

  const onRefresh = useCallback(async () => {
    if (!patientId.trim()) return;
    setRefreshing(true);
    await loadFaces(patientId.trim()).catch(() => {});
    setRefreshing(false);
  }, [patientId]);

  async function handleLoadFaces() {
    if (!patientId.trim()) return;
    await loadFaces(patientId.trim()).catch(() => {
      setError('Could not load faces. Check the patient ID.');
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Manage Faces</Text>
        <Text style={styles.subtitle}>Add people the patient should recognise</Text>
      </View>

      <View style={styles.body}>
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
        <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} />

        {/* Patient ID input */}
        <View style={styles.pidRow}>
          <TextInput
            style={styles.pidInput}
            placeholder="Patient ID (from their profile)"
            placeholderTextColor={colors.textMuted}
            value={patientId}
            onChangeText={setPatientId}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loadBtn} onPress={handleLoadFaces}>
            <Text style={styles.loadBtnText}>Load</Text>
          </TouchableOpacity>
        </View>

        {/* Add face button */}
        {patientId.trim() !== '' && (
          <TouchableOpacity
            style={[styles.addBtn, shadows.md]}
            onPress={() => { resetForm(); setShowModal(true); }}
          >
            <Text style={styles.addBtnText}>+ Add a Person</Text>
          </TouchableOpacity>
        )}

        {loadingFaces ? (
          <LoadingSpinner message="Loading faces..." />
        ) : (
          <FlatList
            data={faces}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FaceCard face={item} onDelete={handleDelete} />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              patientId.trim() ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>👤</Text>
                  <Text style={styles.emptyText}>No faces added yet</Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* Add face modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Person</Text>

            <AlertBanner type="error" message={error} onDismiss={() => setError('')} />

            <Text style={styles.label}>Their Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sarah"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Relationship to Patient</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. daughter, doctor, neighbour"
              placeholderTextColor={colors.textMuted}
              value={relationship}
              onChangeText={setRelationship}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Text style={styles.photoBtnText}>
                {photo ? `✅ Photo selected` : '📷  Choose Photo (optional)'}
              </Text>
            </TouchableOpacity>

            <BigButton title="Save Face" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
            <BigButton
              title="Cancel"
              onPress={() => { setShowModal(false); resetForm(); }}
              variant="secondary"
              style={{ marginTop: spacing.sm }}
            />
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
  pidInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  loadBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, justifyContent: 'center',
  },
  loadBtnText: { color: '#fff', fontSize: fonts.md, fontWeight: fonts.bold },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  addBtnText: { color: '#fff', fontSize: fonts.lg, fontWeight: fonts.bold },
  list: { paddingBottom: spacing.xl },
  empty: { alignItems: 'center', paddingTop: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.lg, color: colors.textSecondary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%' },
  modalContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  modalTitle: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.textPrimary, marginBottom: spacing.xl },
  label: { fontSize: fonts.md, fontWeight: fonts.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary,
    backgroundColor: colors.background, marginBottom: spacing.md,
  },
  photoBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    borderStyle: 'dashed', padding: spacing.lg, alignItems: 'center',
    marginBottom: spacing.sm,
  },
  photoBtnText: { fontSize: fonts.md, color: colors.textSecondary },
});
