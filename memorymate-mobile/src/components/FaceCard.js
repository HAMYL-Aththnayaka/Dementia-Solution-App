// src/components/FaceCard.js
// Displays a known face (caregiver dashboard)

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing, shadows } from '../utils/theme';

export default function FaceCard({ face, onDelete, apiBaseUrl = 'http://localhost:3000' }) {
  const photoUri = face.photoUrl ? `${apiBaseUrl}${face.photoUrl}` : null;

  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.photoPlaceholder}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <Text style={styles.photoEmoji}>👤</Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{face.name}</Text>
        <Text style={styles.relationship}>{face.relationship}</Text>
        {face.createdBy && (
          <Text style={styles.meta}>Added by {face.createdBy.name}</Text>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(face.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
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
  photoPlaceholder: {
    width: 60, height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  photo: { width: 60, height: 60 },
  photoEmoji: { fontSize: 30 },
  info: { flex: 1 },
  name: { fontSize: fonts.lg, fontWeight: fonts.semibold, color: colors.textPrimary },
  relationship: { fontSize: fonts.md, color: colors.primary, marginTop: 2 },
  meta: { fontSize: fonts.sm, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  deleteText: { fontSize: 20 },
});
