// src/components/BigButton.js
// Large, accessible tap target button — used in patient mode
// Meets WCAG minimum 44x44pt touch target size

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing, shadows } from '../utils/theme';

export default function BigButton({
  title,
  onPress,
  variant = 'primary',   // 'primary' | 'secondary' | 'danger' | 'success'
  size = 'large',        // 'large' | 'medium'
  loading = false,
  disabled = false,
  icon = null,           // emoji string e.g. "💊"
  style,
}) {
  const bg = {
    primary: colors.primary,
    secondary: colors.surfaceAlt,
    danger: colors.danger,
    success: colors.success,
  }[variant] || colors.primary;

  const textColor = variant === 'secondary' ? colors.textPrimary : colors.textOnPrimary;

  const paddingV = size === 'large' ? spacing.lg : spacing.md;
  const fontSize = size === 'large' ? fonts.xl : fonts.lg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: bg, paddingVertical: paddingV },
        (disabled || loading) && styles.disabled,
        shadows.md,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize }]}>
          {icon ? `${icon}  ` : ''}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // accessibility minimum
  },
  label: {
    fontWeight: fonts.bold,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
