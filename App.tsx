import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme as useAppTheme } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { lightTheme } from './src/theme/lightTheme';
import { darkTheme } from './src/theme/darkTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: DatePickerModal locale will be registered when component is used

function AppContent() {
  const { isDarkMode } = useAppTheme();

  // Clear old AsyncStorage data on mount
  useEffect(() => {
    const clearOldData = async () => {
      try {
        const themeValue = await AsyncStorage.getItem('theme');
        if (themeValue === 'true' || themeValue === 'false') {
          console.log('Clearing old theme format...');
          await AsyncStorage.removeItem('theme');
        }
      } catch (error) {
        console.error('Error clearing old AsyncStorage:', error);
      }
    };
    clearOldData();
  }, []);

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
