// src/navigation/PatientNavigator.js
// Bottom tab navigator for the patient role — large icons, simple labels

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../utils/theme';

import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import FaceRecognitionScreen from '../screens/patient/FaceRecognitionScreen';
import RemindersScreen from '../screens/patient/RemindersScreen';
import SafeZoneStatusScreen from '../screens/patient/SafeZoneStatusScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return <Text style={{ fontSize: focused ? 30 : 24 }}>{emoji}</Text>;
}

export default function PatientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={PatientHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Recognize"
        component={FaceRecognitionScreen}
        options={{
          tabBarLabel: 'Recognize',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarLabel: 'Reminders',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⏰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Safety"
        component={SafeZoneStatusScreen}
        options={{
          tabBarLabel: 'Safety',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📍" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1E2140',
    borderTopColor: '#2D3160',
    paddingBottom: 8,
    paddingTop: 8,
    height: 75,
  },
  tabLabel: {
    fontSize: fonts.sm,
    fontWeight: fonts.semibold,
    marginTop: 2,
  },
});
