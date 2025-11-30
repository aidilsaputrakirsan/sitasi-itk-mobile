import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { StorageService } from '../utils/storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await StorageService.getTheme();
        console.log('🔍 DEBUG - savedTheme from storage:', savedTheme, typeof savedTheme);

        if (savedTheme !== null) {
          console.log('🔍 DEBUG - Setting isDarkMode to savedTheme:', savedTheme);
          setIsDarkMode(savedTheme);
        } else {
          const systemValue = systemColorScheme === 'dark';
          console.log('🔍 DEBUG - No saved theme, using system:', systemValue);
          setIsDarkMode(systemValue);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        const fallbackValue = systemColorScheme === 'dark';
        console.log('🔍 DEBUG - Error, using fallback:', fallbackValue);
        setIsDarkMode(fallbackValue);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    console.log('🔍 DEBUG - Toggle theme to:', newTheme, typeof newTheme);
    setIsDarkMode(newTheme);
    await StorageService.saveTheme(newTheme);
  };

  console.log('🔍 DEBUG - ThemeContext rendering with isDarkMode:', isDarkMode, typeof isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
