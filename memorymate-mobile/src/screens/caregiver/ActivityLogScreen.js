// src/screens/caregiver/ActivityLogScreen.js
// Shows chronological activity log for the patient

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import { activityEventInfo, formatDate, timeAgo } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ActivityLogScreen() {
  const { activityLog, loadingActivity, loadActivity } = useApp();
  const [patientId, setPatientId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function handleLoad() {
    if (!patientId.trim()) return;
    await loadActivity(patientId.trim()).catch(() => {});
  }

  const onRefresh = useCallback(async () => {
    if (!patientId.trim()) return;
    setRefreshing(true);
    await loadActivity(patientId.trim()).catch(() => {});
    setRefreshing(false);
  }, [patientId]);

  function renderItem({ item }) {
    const info = activityEventInfo(item.eventType);
    const payload = typeof item.payload === 'object' ? item.payload : {};

    return (
      <View style={[styles.logItem, shadows.sm]}>
        <View style={[styles.logIcon, { backgroundColor: info.color + '20' }]}>
          <Text style={styles.logEmoji}>{info.emoji}</Text>
        </View>
        <View style={styles.logBody}>
          <Text style={styles.logLabel}>{info.label}</Text>
          <Text style={styles.logDetail}>
            {payload.title || payload.name || payload.zoneName || payload.action || item.eventType}
          </Text>
          {payload.status && (
            <Text style={[styles.logStatus, { color: statusColor(payload.status) }]}>
              {payload.status}
            </Text>
          )}
        </View>
        <Text style={styles.logTime}>{timeAgo(item.timestamp)}</Text>
      </View>
    );
  }

  function statusColor(status) {
    if (status === 'COMPLETED') return colors.success;
    if (status === 'MISSED') return colors.danger;
    if (status === 'SNOOZED') return colors.warning;
    return colors.textMuted;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Activity Log</Text>
        <Text style={styles.subtitle}>{formatDate(new Date())}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.pidRow}>
          <TextInput
            style={styles.pidInput}
            placeholder="Patient ID"
            placeholderTextColor={colors.textMuted}
            value={patientId}
            onChangeText={setPatientId}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loadBtn} onPress={handleLoad}>
            <Text style={styles.loadBtnText}>Load</Text>
          </TouchableOpacity>
        </View>

        {loadingActivity && !refreshing ? (
          <LoadingSpinner message="Loading activity..." />
        ) : (
          <FlatList
            data={activityLog}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              patientId.trim() ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>📋</Text>
                  <Text style={styles.emptyText}>No activity yet</Text>
                  <Text style={styles.emptySub}>Events will appear here once the patient starts using the app.</Text>
                </View>
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>Enter the patient ID above to load their activity</Text>
                </View>
              )
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
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
  list: { paddingBottom: spacing.xl },
  logItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  logIcon: { width: 48, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  logEmoji: { fontSize: 24 },
  logBody: { flex: 1 },
  logLabel: { fontSize: fonts.md, fontWeight: fonts.semibold, color: colors.textPrimary },
  logDetail: { fontSize: fonts.sm, color: colors.textSecondary, marginTop: 2 },
  logStatus: { fontSize: fonts.sm, fontWeight: fonts.semibold, marginTop: 2 },
  logTime: { fontSize: fonts.xs, color: colors.textMuted, marginLeft: spacing.sm },
  empty: { alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fonts.lg, color: colors.textSecondary, textAlign: 'center' },
  emptySub: { fontSize: fonts.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
