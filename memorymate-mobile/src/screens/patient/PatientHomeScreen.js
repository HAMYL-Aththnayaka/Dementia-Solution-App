// src/screens/patient/PatientHomeScreen.js
// Main home screen for the patient — large clock, greeting, quick info

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, radius } from '../../utils/theme';
import { formatDate, formatTime } from '../../utils/helpers';

export default function PatientHomeScreen() {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  function speakTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
    Speech.speak(`The time is ${timeStr}. Today is ${dateStr}.`, { rate: 0.85, pitch: 1.0 });
  }

  function speakGreeting() {
    Speech.speak(
      `Hello ${user?.name || 'there'}. I am MemoryMate, here to help you today.`,
      { rate: 0.85 }
    );
  }

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <Text style={styles.greetingEmoji}>{greetingEmoji}</Text>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>{user?.name || 'there'}</Text>
        </View>
      </View>

      {/* Big Clock — tap to hear the time */}
      <TouchableOpacity style={styles.clockCard} onPress={speakTime} activeOpacity={0.85}>
        <Text style={styles.clockTime}>{formatTime(currentTime)}</Text>
        <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
        <Text style={styles.clockHint}>🔊  Tap to hear the time</Text>
      </TouchableOpacity>

      {/* Quick action: speak greeting */}
      <TouchableOpacity style={styles.helpCard} onPress={speakGreeting}>
        <Text style={styles.helpEmoji}>🎵</Text>
        <Text style={styles.helpText}>Tap for a greeting</Text>
      </TouchableOpacity>

      {/* Info cards */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>👤</Text>
          <Text style={styles.infoLabel}>Recognize</Text>
          <Text style={styles.infoSub}>Use camera to identify people</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>⏰</Text>
          <Text style={styles.infoLabel}>Reminders</Text>
          <Text style={styles.infoSub}>Today's medications & meals</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity onPress={logout} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.patientBackground },
  content: { padding: spacing.lg, paddingTop: spacing.xl },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  greetingEmoji: { fontSize: 42 },
  greeting: { fontSize: fonts.lg, color: colors.patientSubtext },
  name: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.patientText },

  // Large clock card
  clockCard: {
    backgroundColor: colors.patientSurface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  clockTime: {
    fontSize: 72,
    fontWeight: fonts.bold,
    color: colors.patientText,
    letterSpacing: -2,
  },
  clockDate: {
    fontSize: fonts.xl,
    color: colors.patientSubtext,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  clockHint: {
    marginTop: spacing.lg,
    fontSize: fonts.md,
    color: colors.primary,
    fontWeight: fonts.medium,
  },

  helpCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  helpEmoji: { fontSize: 32 },
  helpText: { fontSize: fonts.xl, color: colors.primaryLight, fontWeight: fonts.semibold },

  infoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  infoCard: {
    flex: 1,
    backgroundColor: colors.patientSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  infoEmoji: { fontSize: 32, marginBottom: spacing.xs },
  infoLabel: { fontSize: fonts.lg, fontWeight: fonts.bold, color: colors.patientText },
  infoSub: { fontSize: fonts.sm, color: colors.patientSubtext, textAlign: 'center', marginTop: 4 },

  signOut: { alignItems: 'center', paddingVertical: spacing.lg },
  signOutText: { fontSize: fonts.md, color: colors.textMuted },
});
