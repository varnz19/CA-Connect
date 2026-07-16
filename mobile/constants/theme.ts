// CA Connect Design System - Color Palette & Theme

export const Colors = {
  // Primary Colors
  primary: '#0B2545',
  primaryLight: '#1A3A5C',
  primaryDark: '#061829',

  // Secondary Colors
  secondary: '#4DA6FF',
  secondaryLight: '#7CC0FF',
  secondaryDark: '#2D8AE6',

  // Background
  background: '#F7FAFC',
  backgroundCard: '#FFFFFF',
  backgroundInput: '#F1F5F9',

  // Text
  textPrimary: '#0B2545',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textLight: '#FFFFFF',
  textMuted: '#CBD5E1',

  // Status
  success: '#22C55E',
  successLight: '#DCFCE7',
  successDark: '#16A34A',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#DC2626',

  info: '#4DA6FF',
  infoLight: '#EFF6FF',
  infoDark: '#2D8AE6',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#4DA6FF',

  // Divider
  divider: '#E2E8F0',

  // Shadow
  shadow: 'rgba(11, 37, 69, 0.08)',
  shadowMedium: 'rgba(11, 37, 69, 0.12)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Status-specific backgrounds
  statusPending: '#FEF3C7',
  statusPendingText: '#92400E',
  statusPaid: '#DCFCE7',
  statusPaidText: '#166534',
  statusOverdue: '#FEE2E2',
  statusOverdueText: '#991B1B',
  statusActive: '#EFF6FF',
  statusActiveText: '#1D4ED8',
  statusCompleted: '#DCFCE7',
  statusCompletedText: '#166534',
  statusCancelled: '#F1F5F9',
  statusCancelledText: '#475569',

  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#0B2545',
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
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
