// src/navigation/AppNavigator.js
// Root navigator — switches between Auth stack and role-based main stack

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PatientNavigator from './PatientNavigator';
import CaregiverNavigator from './CaregiverNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, isLoggedIn, user } = useAuth();

  // Splash / loading state while restoring session from SecureStore
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.patientBackground }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user?.role === 'PATIENT' ? (
          // Patient-specific tab navigator
          <Stack.Screen name="PatientApp" component={PatientNavigator} />
        ) : (
          // Caregiver-specific tab navigator
          <Stack.Screen name="CaregiverApp" component={CaregiverNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
