// src/components/AlertBanner.js
// Inline alert banner for errors, warnings, and success messages

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../utils/theme';

export default function AlertBanner({ type = 'error', message, onDismiss }) {
  if (!message) return null;

  const config = {
    error: { bg: '#FFEDED', border: colors.danger, text: colors.danger, emoji: '⚠️' },
    success: { bg: '#EDFFF2', border: colors.success, text: '#1A8A3A', emoji: '✅' },
    info: { bg: '#EDF4FF', border: colors.primary, text: colors.primaryDark, emoji: 'ℹ️' },
    warning: { bg: '#FFF8ED', border: colors.warning, text: '#8A5A00', emoji: '⚠️' },
  }[type] || { bg: '#FFEDED', border: colors.danger, text: colors.danger, emoji: '⚠️' };

  return (
    <View style={[styles.banner, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.message, { color: config.text }]}>
        {config.emoji}  {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismiss}>
          <Text style={{ color: config.text, fontSize: fonts.xl, fontWeight: fonts.bold }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: { flex: 1, fontSize: fonts.md, lineHeight: 22 },
  dismiss: { paddingLeft: spacing.sm },
});
