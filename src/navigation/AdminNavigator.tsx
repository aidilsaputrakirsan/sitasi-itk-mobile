import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/common/DashboardScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { JadwalAdminScreen } from '../screens/admin/JadwalAdminScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { useNotificationCount } from '../hooks/useNotification';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 11, color: focused ? '#0066CC' : '#999', fontWeight: focused ? '700' : '400' }}>
      {label}
    </Text>
  );
}

export function AdminNavigator() {
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
        name="KelolaTab"
        component={UserManagementScreen}
        options={{
          tabBarLabel: 'Kelola',
          tabBarIcon: ({ focused }) => <TabIcon label="K" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="JadwalTab"
        component={JadwalAdminScreen}
        options={{
          tabBarLabel: 'Jadwal',
          tabBarIcon: ({ focused }) => <TabIcon label="J" focused={focused} />,
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
