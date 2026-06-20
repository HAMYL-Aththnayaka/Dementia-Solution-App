// src/screens/caregiver/DashboardScreen.js
// Caregiver's overview — recent alerts, patient link, quick stats

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import Card from '../../components/Card';
import AlertBanner from '../../components/AlertBanner';
import { timeAgo } from '../../utils/helpers';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, loadNotifications, loadFaces, loadRoutines, loadZones,
    faces, routines, zones } = useApp();

  const [linkedPatient, setLinkedPatient] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Load linked patient on mount (just get me, check links)
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Fetch current user to see if they have a linked patient
    try {
      const me = await authApi.getMe();
      // For demo, use the first patient linked
      // In a full implementation, fetch the list of linked patients
      setLinkedPatient(me.data.data);
    } catch {}

    // If we have a patient ID stored, load their data
    if (linkedPatient?.linkedPatientId) {
      const pid = linkedPatient.linkedPatientId;
      await Promise.all([
        loadFaces(pid).catch(() => {}),
        loadRoutines(pid).catch(() => {}),
        loadZones(pid).catch(() => {}),
      ]);
    }

    await loadNotifications(user.id).catch(() => {});
  }

  async function handleLinkPatient() {
    if (!inviteCode.trim() || inviteCode.trim().length !== 6) {
      setLinkError('Please enter the 6-character invite code');
      return;
    }
    setLinking(true);
    setLinkError('');
    setLinkSuccess('');
    try {
      const res = await authApi.linkPatient(inviteCode.trim().toUpperCase(), 'caregiver');
      setLinkSuccess(`Linked to patient: ${res.data.data.patient.name}`);
      setInviteCode('');
      loadData();
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Could not link. Check the invite code.');
    } finally {
      setLinking(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentAlerts = notifications.filter((n) => n.type === 'ZONE_EXIT').slice(0, 3);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Unread notifications */}
      {unreadCount > 0 && (
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>🔔  {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* Recent zone alerts */}
      {recentAlerts.length > 0 && (
        <Card title="⚠️ Recent Zone Alerts" style={styles.card}>
          {recentAlerts.map((n) => (
            <View key={n.id} style={styles.alertRow}>
              <Text style={styles.alertMsg}>{n.message}</Text>
              <Text style={styles.alertTime}>{timeAgo(n.createdAt)}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, shadows.sm]}>
          <Text style={styles.statNum}>{faces.length}</Text>
          <Text style={styles.statLabel}>Faces</Text>
        </View>
        <View style={[styles.statCard, shadows.sm]}>
          <Text style={styles.statNum}>{routines.length}</Text>
          <Text style={styles.statLabel}>Routines</Text>
        </View>
        <View style={[styles.statCard, shadows.sm]}>
          <Text style={styles.statNum}>{zones.length}</Text>
          <Text style={styles.statLabel}>Safe Zones</Text>
        </View>
      </View>

      {/* Link patient card */}
      <Card title="🔗 Link to a Patient">
        <Text style={styles.linkDesc}>
          Enter your patient's 6-character invite code to connect to their account.
        </Text>

        <AlertBanner type="error" message={linkError} onDismiss={() => setLinkError('')} />
        <AlertBanner type="success" message={linkSuccess} onDismiss={() => setLinkSuccess('')} />

        <View style={styles.linkRow}>
          <TextInput
            style={styles.codeInput}
            placeholder="e.g. DEMO01"
            placeholderTextColor={colors.textMuted}
            value={inviteCode}
            onChangeText={(t) => setInviteCode(t.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.linkBtn, linking && styles.linkBtnDisabled]}
            onPress={handleLinkPatient}
            disabled={linking}
          >
            <Text style={styles.linkBtnText}>{linking ? '...' : 'Link'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.linkHint}>
          The patient can find their invite code on their registration screen.{'\n'}
          Demo patient code: <Text style={{ fontWeight: fonts.bold }}>DEMO01</Text>
        </Text>
      </Card>

      {/* Instructions */}
      <Card title="📋 Getting Started">
        <Text style={styles.step}>1. Link to your patient using their invite code above</Text>
        <Text style={styles.step}>2. Add their known faces in the Faces tab</Text>
        <Text style={styles.step}>3. Set up daily reminders in the Routines tab</Text>
        <Text style={styles.step}>4. Draw a safe zone in the Safe Zones tab</Text>
        <Text style={styles.step}>5. You'll receive alerts if they leave the zone</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  greeting: { fontSize: fonts.md, color: colors.textSecondary },
  name: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.textPrimary },
  logoutBtn: { padding: spacing.sm },
  logoutText: { fontSize: fonts.sm, color: colors.textMuted },

  alertBadge: {
    backgroundColor: colors.danger + '15',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger + '40',
    marginBottom: spacing.md,
  },
  alertBadgeText: { color: colors.danger, fontWeight: fonts.semibold, fontSize: fonts.md },

  card: { marginBottom: spacing.md },

  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  alertMsg: { flex: 1, fontSize: fonts.sm, color: colors.textPrimary },
  alertTime: { fontSize: fonts.xs, color: colors.textMuted, marginLeft: spacing.sm },

  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
  },
  statNum: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.primary },
  statLabel: { fontSize: fonts.sm, color: colors.textSecondary, marginTop: 2 },

  linkDesc: { fontSize: fonts.md, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 22 },
  linkRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  codeInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: fonts.lg, fontWeight: fonts.bold,
    color: colors.textPrimary, backgroundColor: colors.background,
    letterSpacing: 4, textAlign: 'center',
  },
  linkBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, justifyContent: 'center',
  },
  linkBtnDisabled: { opacity: 0.6 },
  linkBtnText: { color: '#fff', fontSize: fonts.lg, fontWeight: fonts.bold },
  linkHint: { fontSize: fonts.sm, color: colors.textMuted, lineHeight: 20 },

  step: { fontSize: fonts.md, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 22 },
});
