// src/utils/theme.js
// Central design system — colors, fonts, spacing, and common styles
// All screens and components import from here for consistency

export const colors = {
  // Primary brand — calm blue-purple (trustworthy, medical feel)
  primary: '#4A6FE3',
  primaryDark: '#3557C4',
  primaryLight: '#7B9AEE',

  // Accent — warm amber for alerts/actions
  accent: '#F5A623',
  accentDark: '#D4861A',

  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',

  // Neutrals
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1FB',
  border: '#E0E4F4',

  // Text
  textPrimary: '#1A1D2E',
  textSecondary: '#5A6080',
  textMuted: '#9BA3C5',
  textOnPrimary: '#FFFFFF',

  // Patient mode — larger contrast
  patientBackground: '#1A1D2E',
  patientSurface: '#252840',
  patientText: '#FFFFFF',
  patientSubtext: '#9BA3C5',
};

export const fonts = {
  // Sizes — larger for patient mode
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 38,

  // Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#4A6FE3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4A6FE3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common screen container styles
export const commonStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  patientScreen: {
    flex: 1,
    backgroundColor: colors.patientBackground,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
};
