// CA Connect Design System - Color Palette & Theme

export const Colors = {
  // Primary Colors
  primary: '#0B2545',
  primaryLight: '#1A3A5C',
  primaryDark: '#061829',

  // Secondary/Accent Colors
  secondary: '#3B82F6',
  secondaryLight: '#93C5FD',
  secondaryDark: '#2563EB',

  // Background
  background: '#F5F7FB',
  backgroundCard: '#FFFFFF',
  backgroundInput: '#F8FAFC',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textLight: '#FFFFFF',
  textMuted: '#CBD5E1',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#EFF6FF',
  infoDark: '#2563EB',

  // Borders
  border: '#E7EDF5',
  borderLight: '#F1F5F9',
  borderFocus: '#3B82F6',

  // Divider
  divider: '#E7EDF5',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',

  // Status-specific backgrounds
  statusPending: '#FEF3C7',
  statusPendingText: '#92400E',
  statusPaid: '#D1FAE5',
  statusPaidText: '#065F46',
  statusOverdue: '#FEE2E2',
  statusOverdueText: '#991B1B',
  statusActive: '#EFF6FF',
  statusActiveText: '#1E40AF',
  statusCompleted: '#D1FAE5',
  statusCompletedText: '#065F46',
  statusCancelled: '#F1F5F9',
  statusCancelledText: '#475569',

  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#94A3B8',
} as const;

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },

  // Font sizes
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Line heights
  lineHeight: {
    xs: 16,
    sm: 18,
    base: 20,
    md: 24,
    lg: 28,
    xl: 30,
    '2xl': 34,
    '3xl': 38,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;
