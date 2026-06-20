// src/services/notificationService.js
// Register device for push notifications and handle incoming notifications

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { authApi } from './api';

// How notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register device and send FCM token to backend
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on real devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Android: set a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MemoryMate Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A6FE3',
      sound: true,
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: true,
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const fcmToken = tokenData.data;

    // Save to backend so cron job can target this device
    await authApi.updateFcmToken(fcmToken);
    console.log('Push token registered:', fcmToken);
    return fcmToken;
  } catch (err) {
    console.log('Could not get push token:', err.message);
    return null;
  }
}

// Schedule a LOCAL notification (used as offline fallback for reminders)
export async function scheduleLocalReminder(routineId, title, body, triggerDate) {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'REMINDER', routineId },
      sound: true,
    },
    trigger: triggerDate, // Date object
  });
  return id;
}

// Cancel a local notification
export async function cancelLocalReminder(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Listen for notification taps (when app is in background/foreground)
export function addNotificationResponseListener(handler) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// Listen for notifications received while app is open
export function addNotificationReceivedListener(handler) {
  return Notifications.addNotificationReceivedListener(handler);
}
