import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { DashboardScreen } from '../screens/common/DashboardScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { JadwalAdminScreen } from '../screens/admin/JadwalAdminScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { useNotificationCount } from '../hooks/useNotification';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, color, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

export function AdminNavigator() {
  const { unreadCount } = useNotificationCount();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon label="🏠" color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="KelolaTab"
        component={UserManagementScreen}
        options={{
          tabBarLabel: 'Kelola',
          tabBarIcon: ({ color }) => <TabIcon label="⚙️" color={color} />,
        }}
      />
      <Tab.Screen
        name="JadwalTab"
        component={JadwalAdminScreen}
        options={{
          tabBarLabel: 'Jadwal',
          tabBarIcon: ({ color }) => <TabIcon label="📅" color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfilTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon label="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

