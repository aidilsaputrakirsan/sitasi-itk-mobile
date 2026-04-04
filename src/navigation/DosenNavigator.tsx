import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/common/DashboardScreen';
import { BimbinganDosenScreen } from '../screens/dosen/BimbinganDosenScreen';
import { SemproDosenScreen } from '../screens/dosen/SemproDosenScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { useNotificationCount } from '../hooks/useNotification';
import type { DosenTabParamList } from './types';

const Tab = createBottomTabNavigator<DosenTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 11, color: focused ? '#0066CC' : '#999', fontWeight: focused ? '700' : '400' }}>
      {label}
    </Text>
  );
}

export function DosenNavigator() {
  const { unreadCount } = useNotificationCount();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: { paddingTop: 4, height: 56 },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon label="D" focused={focused} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="BimbinganTab"
        component={BimbinganDosenScreen}
        options={{
          tabBarLabel: 'Bimbingan',
          tabBarIcon: ({ focused }) => <TabIcon label="B" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AkademikTab"
        component={SemproDosenScreen}
        options={{
          tabBarLabel: 'Akademik',
          tabBarIcon: ({ focused }) => <TabIcon label="A" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfilTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon label="P" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
