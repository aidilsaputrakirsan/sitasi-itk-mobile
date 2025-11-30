import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { MainTabParamList, ProfileStackParamList, BimbinganStackParamList } from '../types';

// Home
import { HomeScreen } from '../screens/home/HomeScreen';

// Bimbingan Stack
import { BimbinganListScreen } from '../screens/bimbingan/BimbinganListScreen';
import { BimbinganDetailScreen } from '../screens/bimbingan/BimbinganDetailScreen';
import { CreateBimbinganScreen } from '../screens/bimbingan/CreateBimbinganScreen';
import { EditBimbinganScreen } from '../screens/bimbingan/EditBimbinganScreen';

// Profile Stack
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const BimbinganStack = createNativeStackNavigator<BimbinganStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const BimbinganNavigator = () => {
  return (
    <BimbinganStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BimbinganStack.Screen name="BimbinganList" component={BimbinganListScreen} />
      <BimbinganStack.Screen name="BimbinganDetail" component={BimbinganDetailScreen} />
      <BimbinganStack.Screen name="CreateBimbingan" component={CreateBimbinganScreen} />
      <BimbinganStack.Screen name="EditBimbingan" component={EditBimbinganScreen} />
    </BimbinganStack.Navigator>
  );
};

const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </ProfileStack.Navigator>
  );
};

export const MainNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bimbingan"
        component={BimbinganNavigator}
        options={{
          title: 'Bimbingan',
          tabBarLabel: 'Bimbingan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
