import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { DashboardScreen } from '../screens/common/DashboardScreen';
import { BimbinganDosenScreen } from '../screens/dosen/BimbinganDosenScreen';
import { SemproDosenScreen } from '../screens/dosen/SemproDosenScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { useNotificationCount } from '../hooks/useNotification';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import type { DosenTabParamList } from './types';

const Tab = createBottomTabNavigator<DosenTabParamList>();

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, color, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

export function DosenNavigator() {
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
        name="BimbinganTab"
        component={BimbinganDosenScreen}
        options={{
          tabBarLabel: 'Bimbingan',
          tabBarIcon: ({ color }) => <TabIcon label="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="AkademikTab"
        component={SemproDosenScreen}
        options={{
          tabBarLabel: 'Akademik',
          tabBarIcon: ({ color }) => <TabIcon label="🎓" color={color} />,
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

