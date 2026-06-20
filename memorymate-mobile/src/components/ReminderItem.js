// src/components/ReminderItem.js
// Single routine reminder card — used in patient's RemindersScreen

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing, shadows } from '../utils/theme';
import { formatScheduleTime, routineTypeInfo } from '../utils/helpers';

export default function ReminderItem({ routine, onDone, onSnooze, status }) {
  const info = routineTypeInfo(routine.type);
  const isDone = status === 'COMPLETED';
  const isSnoozed = status === 'SNOOZED';
  const isMissed = status === 'MISSED';

  return (
    <View style={[styles.card, shadows.sm, isDone && styles.doneCard]}>
      <View style={[styles.typeTag, { backgroundColor: info.color + '22' }]}>
        <Text style={styles.emoji}>{info.emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, isDone && styles.doneText]}>{routine.title}</Text>
        <Text style={styles.time}>{formatScheduleTime(routine.scheduleTime)}</Text>
        {routine.description ? (
          <Text style={styles.desc}>{routine.description}</Text>
        ) : null}
        {isMissed && <Text style={styles.missedTag}>Missed</Text>}
        {isSnoozed && <Text style={styles.snoozedTag}>Snoozed</Text>}
        {isDone && <Text style={styles.doneTag}>✓ Done</Text>}
      </View>

      {!isDone && !isMissed && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.doneBtn]}
            onPress={() => onDone(routine.id)}
          >
            <Text style={styles.actionBtnText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.snoozeBtn]}
            onPress={() => onSnooze(routine.id)}
          >
            <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>💤</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  doneCard: { opacity: 0.6 },
  typeTag: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  emoji: { fontSize: 24 },
  info: { flex: 1 },
  title: { fontSize: fonts.lg, fontWeight: fonts.semibold, color: colors.textPrimary },
  doneText: { textDecorationLine: 'line-through' },
  time: { fontSize: fonts.md, color: colors.primary, marginTop: 2 },
  desc: { fontSize: fonts.sm, color: colors.textSecondary, marginTop: 2 },
  missedTag: { color: colors.danger, fontSize: fonts.sm, fontWeight: fonts.semibold, marginTop: 4 },
  snoozedTag: { color: colors.warning, fontSize: fonts.sm, fontWeight: fonts.semibold, marginTop: 4 },
  doneTag: { color: colors.success, fontSize: fonts.sm, fontWeight: fonts.semibold, marginTop: 4 },
  actions: { flexDirection: 'column', gap: 8 },
  actionBtn: {
    width: 44, height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtn: { backgroundColor: colors.success },
  snoozeBtn: { backgroundColor: colors.surfaceAlt },
  actionBtnText: { fontSize: fonts.lg, color: '#fff', fontWeight: fonts.bold },
});
