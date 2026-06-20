// src/components/Card.js
// General-purpose card container with optional title and shadow

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing, shadows } from '../utils/theme';

export default function Card({ title, children, style, titleColor, dark = false }) {
  const bg = dark ? colors.patientSurface : colors.surface;
  const titleCol = titleColor || (dark ? colors.patientText : colors.textPrimary);

  return (
    <View style={[styles.card, { backgroundColor: bg }, shadows.sm, style]}>
      {title ? (
        <Text style={[styles.title, { color: titleCol }]}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fonts.lg,
    fontWeight: fonts.semibold,
    marginBottom: spacing.sm,
  },
});
