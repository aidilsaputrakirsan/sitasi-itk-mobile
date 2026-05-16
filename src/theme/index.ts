import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

/**
 * Palette SITASI ITK
 * Base: #1e6cb7 (biru ITK) dipadukan amber sebagai aksen.
 * Skema MD3 — kombinasi profesional-akademik (biru ITK + amber + slate netral).
 */
export const palette = {
  primary: '#1e6cb7',
  primaryDark: '#0e4a82',
  primaryLight: '#4a90c2',
  primaryContainer: '#d4e6f7',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#0a3766',

  secondary: '#475569',
  secondaryContainer: '#e2e8f0',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#1e293b',

  tertiary: '#f59e0b',
  tertiaryContainer: '#fef3c7',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#78350f',

  success: '#10b981',
  successContainer: '#d1fae5',
  warning: '#f59e0b',
  warningContainer: '#fef3c7',
  error: '#ef4444',
  errorContainer: '#fee2e2',
  onError: '#ffffff',
  onErrorContainer: '#7f1d1d',

  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  onBackground: '#0f172a',
  onSurface: '#0f172a',
  onSurfaceVariant: '#475569',

  outline: '#cbd5e1',
  outlineVariant: '#e2e8f0',

  // Status TA (custom)
  statusCreated: '#3b82f6',
  statusApproved: '#10b981',
  statusRejected: '#ef4444',
  statusRevision: '#f59e0b',
  statusOnProcess: '#6366f1',
  statusScheduled: '#8b5cf6',
} as const;

const fontConfig = {
  default: { fontFamily: 'System', fontWeight: '400' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const, fontSize: 12, lineHeight: 16 },
  titleLarge: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 22, lineHeight: 28 },
  titleMedium: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 16, lineHeight: 24 },
  titleSmall: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 14, lineHeight: 20 },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 14, lineHeight: 20 },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 12, lineHeight: 16 },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const, fontSize: 11, lineHeight: 16 },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 24, lineHeight: 32 },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const, fontSize: 28, lineHeight: 36 },
  headlineLarge: { fontFamily: 'System', fontWeight: '700' as const, fontSize: 32, lineHeight: 40 },
};

export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    onPrimary: palette.onPrimary,
    primaryContainer: palette.primaryContainer,
    onPrimaryContainer: palette.onPrimaryContainer,
    secondary: palette.secondary,
    onSecondary: palette.onSecondary,
    secondaryContainer: palette.secondaryContainer,
    onSecondaryContainer: palette.onSecondaryContainer,
    tertiary: palette.tertiary,
    onTertiary: palette.onTertiary,
    tertiaryContainer: palette.tertiaryContainer,
    onTertiaryContainer: palette.onTertiaryContainer,
    error: palette.error,
    onError: palette.onError,
    errorContainer: palette.errorContainer,
    onErrorContainer: palette.onErrorContainer,
    background: palette.background,
    onBackground: palette.onBackground,
    surface: palette.surface,
    onSurface: palette.onSurface,
    surfaceVariant: palette.surfaceVariant,
    onSurfaceVariant: palette.onSurfaceVariant,
    outline: palette.outline,
    outlineVariant: palette.outlineVariant,
  },
  fonts: configureFonts({ config: fontConfig }),
};

export type AppTheme = typeof theme;

/** Helper warna untuk status TA — gunakan di komponen StatusBadge */
export const statusColor = (
  status: string
): { bg: string; fg: string } => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'approved':
    case 'diterima':
      return { bg: palette.successContainer, fg: palette.success };
    case 'rejected':
    case 'ditolak':
      return { bg: palette.errorContainer, fg: palette.error };
    case 'revision':
      return { bg: palette.warningContainer, fg: palette.warning };
    case 'on_process':
    case 'pending':
      return { bg: '#e0e7ff', fg: palette.statusOnProcess };
    case 'scheduled':
      return { bg: '#ede9fe', fg: palette.statusScheduled };
    case 'created':
    default:
      return { bg: '#dbeafe', fg: palette.statusCreated };
  }
};
