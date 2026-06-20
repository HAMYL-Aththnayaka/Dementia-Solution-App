// App.js — Root entry point
// Wraps everything in Context providers and loads the navigator

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
} from './src/services/notificationService';

// Inner component so it can use useAuth
function RootApp() {
  const { isLoggedIn } = useAuth();

  // Register for push notifications after login
  useEffect(() => {
    if (!isLoggedIn) return;

    registerForPushNotifications().catch(() => {});

    // Handle notification tap (when app is backgrounded)
    const sub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      // TODO: navigate to relevant screen based on data.type
    });

    return () => sub.remove();
  }, [isLoggedIn]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="light" />
          <RootApp />
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
