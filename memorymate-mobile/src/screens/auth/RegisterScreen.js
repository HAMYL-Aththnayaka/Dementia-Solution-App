// src/screens/auth/RegisterScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';
import BigButton from '../../components/BigButton';
import AlertBanner from '../../components/AlertBanner';

const ROLES = ['PATIENT', 'CAREGIVER'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CAREGIVER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, role);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <View style={styles.header}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>MemoryMate</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={[styles.card, shadows.md]}>
          <Text style={styles.title}>Register</Text>

          <AlertBanner type="error" message={error} onDismiss={() => setError('')} />

          {/* Role selector */}
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              >
                <Text style={styles.roleEmoji}>{r === 'PATIENT' ? '🧑' : '🏥'}</Text>
                <Text style={[styles.roleLabel, role === r && styles.roleLabelActive]}>
                  {r === 'PATIENT' ? 'Patient' : 'Caregiver'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

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
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
          />

          {role === 'PATIENT' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📋 After registering, you'll receive an invite code to share with your caregiver so they can link to your account.
              </Text>
            </View>
          )}

          <BigButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Sign In</Text>
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
  appName: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.patientText, marginTop: spacing.sm },
  tagline: { fontSize: fonts.md, color: colors.patientSubtext, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg },
  title: { fontSize: fonts.xxl, fontWeight: fonts.bold, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { fontSize: fonts.md, fontWeight: fonts.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: fonts.md, color: colors.textPrimary,
    backgroundColor: colors.background, marginBottom: spacing.md,
  },
  roleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  roleBtn: {
    flex: 1, alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  roleBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  roleEmoji: { fontSize: 32, marginBottom: spacing.xs },
  roleLabel: { fontSize: fonts.md, fontWeight: fonts.semibold, color: colors.textSecondary },
  roleLabelActive: { color: colors.primary },
  infoBox: {
    backgroundColor: colors.primary + '10',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoText: { fontSize: fonts.sm, color: colors.primaryDark, lineHeight: 20 },
  linkRow: { alignItems: 'center', marginTop: spacing.md },
  linkText: { fontSize: fonts.md, color: colors.patientSubtext },
  link: { color: colors.primaryLight, fontWeight: fonts.semibold },
});
