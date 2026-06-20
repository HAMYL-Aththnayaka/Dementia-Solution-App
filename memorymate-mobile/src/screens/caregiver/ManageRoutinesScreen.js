// src/screens/caregiver/ManageRoutinesScreen.js
// Caregiver creates and manages reminders for the patient

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, ScrollView, RefreshControl,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { routinesApi } from '../../services/api';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import BigButton from '../../components/BigButton';
import AlertBanner from '../../components/AlertBanner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { routineTypeInfo, formatScheduleTime } from '../../utils/helpers';

const ROUTINE_TYPES = ['MEDICATION', 'MEAL', 'APPOINTMENT', 'OTHER'];

export default function ManageRoutinesScreen() {
  const { routines, loadingRoutines, loadRoutines } = useApp();

  const [patientId, setPatientId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [type, setType] = useState('MEDICATION');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  function resetForm() {
    setTitle('');
    setDescription('');
    setScheduleTime('08:00');
    setType('MEDICATION');
    setEditingId(null);
    setError('');
  }

  function openAdd() {
    resetForm();
    setShowModal(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!scheduleTime.match(/^\d{2}:\d{2}$/)) {
      setError('Time must be in HH:MM format (e.g. 08:30)');
      return;
    }
    if (!patientId.trim()) {
      setError('Please enter the patient ID first');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const data = { title: title.trim(), description: description.trim(), scheduleTime, type };
      if (editingId) {
        await routinesApi.update(editingId, data);
        setSuccess('Routine updated');
      } else {
        await routinesApi.create(patientId.trim(), data);
        setSuccess(`${title} added`);
      }
      setShowModal(false);
      resetForm();
      await loadRoutines(patientId.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save routine');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await routinesApi.delete(id);
      await loadRoutines(patientId.trim());
    } catch {
      setError('Could not delete routine');
    }
  }

  async function handleLoadRoutines() {
    if (!patientId.trim()) return;
    await loadRoutines(patientId.trim()).catch(() => setError('Could not load routines'));
  }

  const onRefresh = useCallback(async () => {
    if (!patientId.trim()) return;
    setRefreshing(true);
    await loadRoutines(patientId.trim()).catch(() => {});
    setRefreshing(false);
  }, [patientId]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>⏰ Manage Routines</Text>
        <Text style={styles.subtitle}>Set up daily reminders for the patient</Text>
      </View>

      <View style={styles.body}>
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
        <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} />

        <View style={styles.pidRow}>
          <TextInput
            style={styles.pidInput}
            placeholder="Patient ID"
            placeholderTextColor={colors.textMuted}
            value={patientId}
            onChangeText={setPatientId}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loadBtn} onPress={handleLoadRoutines}>
            <Text style={styles.loadBtnText}>Load</Text>
          </TouchableOpacity>
        </View>

        {patientId.trim() !== '' && (
          <TouchableOpacity style={[styles.addBtn, shadows.sm]} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add Reminder</Text>
          </TouchableOpacity>
        )}

        {loadingRoutines && !refreshing ? (
          <LoadingSpinner message="Loading routines..." />
        ) : (
          <FlatList
            data={routines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const info = routineTypeInfo(item.type);
              return (
                <View style={[styles.routineCard, shadows.sm]}>
                  <View style={[styles.typeTag, { backgroundColor: info.color + '22' }]}>
                    <Text style={styles.typeEmoji}>{info.emoji}</Text>
                  </View>
                  <View style={styles.routineInfo}>
                    <Text style={styles.routineTitle}>{item.title}</Text>
                    <Text style={styles.routineTime}>{formatScheduleTime(item.scheduleTime)} · {info.label}</Text>
                    {item.description ? <Text style={styles.routineDesc}>{item.description}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              patientId.trim() ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>⏰</Text>
                  <Text style={styles.emptyText}>No routines yet</Text>
                </View>
              ) : null
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>

      {/* Add/Edit modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit' : 'Add'} Reminder</Text>

            <AlertBanner type="error" message={error} onDismiss={() => setError('')} />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {ROUTINE_TYPES.map((t) => {
                const info = routineTypeInfo(t);
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  >
                    <Text style={styles.typeBtnEmoji}>{info.emoji}</Text>
                    <Text style={[styles.typeBtnLabel, type === t && { color: colors.primary }]}>
                      {info.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning Medication"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="e.g. Take blood pressure tablet with water"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Time (HH:MM, 24-hour)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 08:30"
              placeholderTextColor={colors.textMuted}
              value={scheduleTime}
              onChangeText={setScheduleTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <BigButton title="Save Reminder" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
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
  pidInput: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary, backgroundColor: colors.surface },
  loadBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  loadBtnText: { color: '#fff', fontSize: fonts.md, fontWeight: fonts.bold },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  addBtnText: { color: '#fff', fontSize: fonts.lg, fontWeight: fonts.bold },
  list: { paddingBottom: spacing.xl },
  routineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  typeTag: { width: 48, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  typeEmoji: { fontSize: 24 },
  routineInfo: { flex: 1 },
  routineTitle: { fontSize: fonts.lg, fontWeight: fonts.semibold, color: colors.textPrimary },
  routineTime: { fontSize: fonts.sm, color: colors.primary, marginTop: 2 },
  routineDesc: { fontSize: fonts.sm, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  deleteText: { fontSize: 20 },
  empty: { alignItems: 'center', paddingTop: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.lg, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '90%' },
  modalContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  modalTitle: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.textPrimary, marginBottom: spacing.xl },
  label: { fontSize: fonts.md, fontWeight: fonts.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary, backgroundColor: colors.background, marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  typeBtn: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  typeBtnEmoji: { fontSize: 22 },
  typeBtnLabel: { fontSize: fonts.xs, color: colors.textSecondary, marginTop: 2, fontWeight: fonts.medium },
});
