// src/components/LoadingSpinner.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../utils/theme';

export default function LoadingSpinner({ message = 'Loading...', dark = false }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={dark ? colors.primaryLight : colors.primary} />
      <Text style={[styles.text, { color: dark ? colors.patientSubtext : colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  text: { marginTop: spacing.md, fontSize: fonts.md },
});
