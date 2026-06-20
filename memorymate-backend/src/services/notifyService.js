// src/services/notifyService.js
// Firebase Cloud Messaging (FCM) push notification sender
// Falls back gracefully if Firebase is not configured (dev mode)

const config = require('../config');

let firebaseAdmin = null;

// Initialize Firebase Admin SDK once
function initFirebase() {
  if (firebaseAdmin) return firebaseAdmin; // already initialized

  const { projectId, privateKey, clientEmail } = config.firebase;

  // Skip if Firebase credentials are not set (development mode)
  if (!projectId || !privateKey || !clientEmail) {
    console.log('ℹ️  Firebase not configured — push notifications disabled in dev mode');
    return null;
  }

  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });
    }
    firebaseAdmin = admin;
    console.log('✅ Firebase Admin SDK initialized');
    return firebaseAdmin;
  } catch (err) {
    console.error('⚠️  Firebase init failed:', err.message);
    return null;
  }
}

// Send a push notification to a single FCM token
async function sendPush(fcmToken, title, body, data = {}) {
  const admin = initFirebase();

  if (!admin) {
    // Dev mode: just log what would have been sent
    console.log(`[DEV] Push notification skipped (Firebase not configured)`);
    console.log(`  To    : ${fcmToken || 'no token'}`);
    console.log(`  Title : ${title}`);
    console.log(`  Body  : ${body}`);
    return { success: false, reason: 'firebase_not_configured' };
  }

  if (!fcmToken) {
    console.log('⚠️  sendPush called with no FCM token');
    return { success: false, reason: 'no_fcm_token' };
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: { ...data }, // extra key-value pairs for the app to handle
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };

    const result = await admin.messaging().send(message);
    console.log(`✅ Push sent: ${result}`);
    return { success: true, messageId: result };
  } catch (err) {
    console.error('Push notification error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendPush };
