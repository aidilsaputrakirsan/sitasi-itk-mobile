import { MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../utils/constants';

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.secondary,  // Brighter blue for dark mode
    secondary: COLORS.secondary,
    error: COLORS.error,
  },
};
