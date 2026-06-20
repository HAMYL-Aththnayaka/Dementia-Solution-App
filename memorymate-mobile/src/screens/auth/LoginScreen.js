// src/screens/auth/LoginScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import BigButton from '../../components/BigButton';
import AlertBanner from '../../components/AlertBanner';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation happens automatically via AppNavigator when isLoggedIn changes
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>MemoryMate</Text>
          <Text style={styles.tagline}>Caring support, always with you</Text>
        </View>

        {/* Form */}
        <View style={[styles.card, shadows.md]}>
          <Text style={styles.title}>Welcome back</Text>

          <AlertBanner type="error" message={error} onDismiss={() => setError('')} />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <BigButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoText}>Demo: patient@demo.com / password123</Text>
          </View>
        </View>

        {/* Register link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.link}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.patientBackground },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 64 },
  appName: {
    fontSize: fonts.xxxl,
    fontWeight: fonts.bold,
    color: colors.patientText,
    marginTop: spacing.sm,
  },
  tagline: { fontSize: fonts.md, color: colors.patientSubtext, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.xxl,
    fontWeight: fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: { fontSize: fonts.md, fontWeight: fonts.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fonts.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  demoHint: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  demoText: { fontSize: fonts.xs, color: colors.textMuted, textAlign: 'center' },
  linkRow: { alignItems: 'center', marginTop: spacing.md },
  linkText: { fontSize: fonts.md, color: colors.patientSubtext },
  link: { color: colors.primaryLight, fontWeight: fonts.semibold },
});
