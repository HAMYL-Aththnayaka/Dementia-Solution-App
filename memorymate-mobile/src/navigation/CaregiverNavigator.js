// src/navigation/CaregiverNavigator.js
// Bottom tab navigator for the caregiver role

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { colors, fonts } from '../utils/theme';
import { useApp } from '../context/AppContext';

import DashboardScreen from '../screens/caregiver/DashboardScreen';
import ManageFacesScreen from '../screens/caregiver/ManageFacesScreen';
import ManageRoutinesScreen from '../screens/caregiver/ManageRoutinesScreen';
import SafeZoneEditorScreen from '../screens/caregiver/SafeZoneEditorScreen';
import ActivityLogScreen from '../screens/caregiver/ActivityLogScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused, badge }) {
  return (
    <View>
      <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

function DashboardIcon({ focused }) {
  const { unreadCount } = useApp();
  return <TabIcon emoji="📊" focused={focused} badge={unreadCount} />;
}

export default function CaregiverNavigator() {
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
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <DashboardIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Faces"
        component={ManageFacesScreen}
        options={{
          tabBarLabel: 'Faces',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Routines"
        component={ManageRoutinesScreen}
        options={{
          tabBarLabel: 'Routines',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⏰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SafeZones"
        component={SafeZoneEditorScreen}
        options={{
          tabBarLabel: 'Safe Zones',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityLogScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
  },
  tabLabel: { fontSize: 11, fontWeight: fonts.medium },
  badge: {
    position: 'absolute',
    top: -4, right: -8,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16, height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: fonts.bold },
});
