// src/screens/patient/RemindersScreen.js
// Shows today's reminders — patient taps Done or Snooze

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { routinesApi } from '../../services/api';
import { colors, fonts, spacing } from '../../utils/theme';
import ReminderItem from '../../components/ReminderItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertBanner from '../../components/AlertBanner';
import { formatDate } from '../../utils/helpers';

export default function RemindersScreen() {
  const { user } = useAuth();
  const { routines, loadingRoutines, loadRoutines } = useApp();
  const [routineStatuses, setRoutineStatuses] = useState({}); // routineId -> status
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) loadRoutines(user.id).catch(() => {});
  }, [user?.id]);

  async function handleDone(routineId) {
    try {
      await routinesApi.log(routineId, 'COMPLETED');
      setRoutineStatuses((prev) => ({ ...prev, [routineId]: 'COMPLETED' }));
    } catch {
      setError('Could not mark as done. Please try again.');
    }
  }

  async function handleSnooze(routineId) {
    try {
      await routinesApi.log(routineId, 'SNOOZED');
      setRoutineStatuses((prev) => ({ ...prev, [routineId]: 'SNOOZED' }));
    } catch {
      setError('Could not snooze. Please try again.');
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRoutineStatuses({});
    await loadRoutines(user.id).catch(() => {});
    setRefreshing(false);
  }, [user?.id]);

  if (loadingRoutines && !refreshing) {
    return <LoadingSpinner message="Loading reminders..." dark />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Reminders</Text>
        <Text style={styles.headerDate}>{formatDate(new Date())}</Text>
      </View>

      <AlertBanner type="error" message={error} onDismiss={() => setError('')} />

      {routines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyText}>No reminders set up yet</Text>
          <Text style={styles.emptySub}>Ask your caregiver to add some reminders.</Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderItem
              routine={item}
              status={routineStatuses[item.id]}
              onDone={handleDone}
              onSnooze={handleSnooze}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.patientBackground },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  headerTitle: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.patientText },
  headerDate: { fontSize: fonts.md, color: colors.patientSubtext, marginTop: spacing.xs },
  list: { padding: spacing.lg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.xl, fontWeight: fonts.bold, color: colors.patientText, textAlign: 'center' },
  emptySub: { fontSize: fonts.md, color: colors.patientSubtext, textAlign: 'center', marginTop: spacing.sm },
});
