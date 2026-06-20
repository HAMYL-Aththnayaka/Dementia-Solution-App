// src/screens/patient/FaceRecognitionScreen.js
// Patient taps to take a photo; the app tries to identify who is in frame

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { useAuth } from '../../context/AuthContext';
import { matchFaceViaBackend } from '../../ml/faceRecognition';
import { colors, fonts, spacing, radius, shadows } from '../../utils/theme';

export default function FaceRecognitionScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null); // { matched, face, confidence }
  const [error, setError] = useState('');
  const cameraRef = useRef(null);

  // Announce result via speech
  useEffect(() => {
    if (!result) return;
    if (result.matched) {
      Speech.speak(
        `This is ${result.face.name}, your ${result.face.relationship}.`,
        { rate: 0.82, pitch: 1.05 }
      );
    } else {
      Speech.speak("I don't recognise this person yet.", { rate: 0.82 });
    }
  }, [result]);

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.permText}>📷</Text>
        <Text style={styles.permMessage}>Camera access is needed to recognize faces</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || matching) return;
    setResult(null);
    setError('');
    setMatching(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      const matchResult = await matchFaceViaBackend(user.id, photo.uri);
      setResult(matchResult);
    } catch (err) {
      setError('Could not process the photo. Please try again.');
      console.error('Face match error:', err);
    } finally {
      setMatching(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setError('');
  }

  return (
    <View style={styles.screen}>
      {/* Camera viewfinder */}
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        {/* Overlay frame */}
        <View style={styles.overlay}>
          <View style={styles.frameBox} />
          <Text style={styles.hint}>Point the camera at a person's face</Text>
        </View>
      </CameraView>

      {/* Result panel */}
      <View style={styles.panel}>
        {matching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.matchingText}>Recognising...</Text>
          </View>
        ) : result ? (
          result.matched ? (
            <View style={styles.matchResult}>
              <Text style={styles.matchEmoji}>😊</Text>
              <Text style={styles.matchName}>{result.face.name}</Text>
              <Text style={styles.matchRelation}>{result.face.relationship}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noMatchResult}>
              <Text style={styles.noMatchEmoji}>🤷</Text>
              <Text style={styles.noMatchText}>I don't recognise this person yet</Text>
              {result.reason === 'No faces enrolled yet' && (
                <Text style={styles.noMatchSub}>Ask your caregiver to add some faces first.</Text>
              )}
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Capture button */
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.patientBackground },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frameBox: {
    width: 240, height: 280,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: spacing.lg,
    color: '#fff',
    fontSize: fonts.lg,
    fontWeight: fonts.semibold,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  panel: {
    backgroundColor: colors.patientSurface,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  matchingText: { color: colors.patientSubtext, fontSize: fonts.lg, marginTop: spacing.md },

  matchResult: { alignItems: 'center' },
  matchEmoji: { fontSize: 48 },
  matchName: { fontSize: fonts.xxxl, fontWeight: fonts.bold, color: colors.patientText },
  matchRelation: { fontSize: fonts.xl, color: colors.primary, marginTop: spacing.xs },

  noMatchResult: { alignItems: 'center' },
  noMatchEmoji: { fontSize: 48 },
  noMatchText: { fontSize: fonts.xl, fontWeight: fonts.bold, color: colors.patientText, textAlign: 'center', marginTop: spacing.sm },
  noMatchSub: { fontSize: fonts.md, color: colors.patientSubtext, textAlign: 'center', marginTop: spacing.xs },

  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  retryText: { color: colors.primaryLight, fontSize: fonts.md, fontWeight: fonts.semibold },
  errorText: { color: colors.danger, fontSize: fonts.lg, textAlign: 'center', marginBottom: spacing.md },

  captureBtn: {
    width: 88, height: 88,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  captureBtnInner: {
    width: 68, height: 68,
    borderRadius: radius.full,
    backgroundColor: '#fff',
  },
  permText: { fontSize: 64, marginBottom: spacing.md },
  permMessage: { fontSize: fonts.xl, color: colors.patientSubtext, textAlign: 'center', marginBottom: spacing.xl },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  permBtnText: { color: '#fff', fontSize: fonts.lg, fontWeight: fonts.bold },
});
