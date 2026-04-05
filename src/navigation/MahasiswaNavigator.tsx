import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { DashboardScreen } from '../screens/common/DashboardScreen';
import { BimbinganScreen } from '../screens/mahasiswa/BimbinganScreen';
import { SemproScreen } from '../screens/mahasiswa/SemproScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { useNotificationCount } from '../hooks/useNotification';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import type { MahasiswaTabParamList } from './types';

const Tab = createBottomTabNavigator<MahasiswaTabParamList>();

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, color, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

export function MahasiswaNavigator() {
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
        component={BimbinganScreen}
        options={{
          tabBarLabel: 'Bimbingan',
          tabBarIcon: ({ color }) => <TabIcon label="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="AkademikTab"
        component={SemproScreen}
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
