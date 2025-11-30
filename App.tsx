import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme as useAppTheme } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { lightTheme } from './src/theme/lightTheme';
import { darkTheme } from './src/theme/darkTheme';
import { id, registerTranslation } from 'react-native-paper-dates';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Register Indonesian locale for date picker
registerTranslation('id', id);

// Clear old AsyncStorage data on app start (run once)
AsyncStorage.getItem('theme').then((value) => {
  if (value && (value === 'true' || value === 'false')) {
    // Old string format detected, clear it
    console.log('Clearing old theme format...');
    AsyncStorage.removeItem('theme');
  }
});

function AppContent() {
  const { isDarkMode } = useAppTheme();

  return (
    <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
