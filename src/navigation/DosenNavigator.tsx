import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ClipboardCheck, GraduationCap, UserRound } from 'lucide-react-native';
import { DashboardScreen } from '../screens/common/DashboardScreen';
import { BimbinganDosenScreen } from '../screens/dosen/BimbinganDosenScreen';
import { SemproDosenScreen } from '../screens/dosen/SemproDosenScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { useNotificationCount } from '../hooks/useNotification';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import { TabIcon } from './TabIcon';
import type { DosenTabParamList } from './types';

const Tab = createBottomTabNavigator<DosenTabParamList>();

export function DosenNavigator() {
  const { unreadCount } = useNotificationCount();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="BimbinganTab"
        component={BimbinganDosenScreen}
        options={{
          tabBarLabel: 'Bimbingan',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={ClipboardCheck} color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AkademikTab"
        component={SemproDosenScreen}
        options={{
          tabBarLabel: 'Akademik',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={GraduationCap} color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfilTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={UserRound} color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

