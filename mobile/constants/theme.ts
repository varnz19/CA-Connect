// CA Connect Design System - Color Palette & Theme

export const Colors = {
  // Ledger & Seal Core Colors
  primary: '#14261E',       // --ink-900
  primaryLight: '#1F3D2E',  // --ink-700
  primaryDark: '#0A130F',

  secondary: '#B8863A',     // --brass
  secondaryLight: '#EFE3C8',// --brass-soft
  secondaryDark: '#8A652B',

  // Backgrounds
  background: '#F5F6F1',    // --paper
  backgroundCard: '#FBFBF8',// --paper-card
  backgroundInput: '#FBFBF8',

  // Text
  textPrimary: '#14261E',   // --ink-900
  textSecondary: '#5B6560', // --text-secondary
  textTertiary: '#8A9590',
  textLight: '#F5F6F1',     // --paper
  textMuted: '#DAD9CE',     // --rule

  // Status & Actions
  success: '#1F3D2E',       // Using ink-700 for success (official)
  successLight: '#EFE3C8',
  successDark: '#14261E',

  warning: '#B8863A',       // brass
  warningLight: '#EFE3C8',
  warningDark: '#8A652B',

  danger: '#A34B34',        // --rust
  dangerLight: '#FDECE8',
  dangerDark: '#7A3827',

  info: '#1F3D2E',          // ink-700
  infoLight: '#EFE3C8',
  infoDark: '#14261E',

  // Borders & Rules
  border: '#DAD9CE',        // --rule
  borderLight: '#EBEBE4',
  borderFocus: '#1F3D2E',   // --ink-700

  divider: '#DAD9CE',       // --rule

  // Overlay
  overlay: 'rgba(20, 38, 30, 0.5)',
  overlayLight: 'rgba(20, 38, 30, 0.2)',

  // Status-specific backgrounds (Subtle paper/brass/rust tints)
  statusPending: '#EFE3C8',
  statusPendingText: '#B8863A',
  statusPaid: '#EBEBE4',
  statusPaidText: '#1F3D2E',
  statusOverdue: '#FDECE8',
  statusOverdueText: '#A34B34',
  statusActive: '#EFE3C8',
  statusActiveText: '#14261E',
  statusCompleted: '#EBEBE4',
  statusCompletedText: '#1F3D2E',
  statusCancelled: '#F5F6F1',
  statusCancelledText: '#5B6560',

  // Tab Bar
  tabBarBackground: '#14261E', // --ink-900
  tabBarActive: '#B8863A',     // --brass
  tabBarInactive: '#5B6560',   // --text-secondary
} as const;

export const Typography = {
  // Font families
  fontFamily: {
    // Inter for UI
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    // Fraunces for display/headings
    displayRegular: 'Fraunces_400Regular',
    displayMedium: 'Fraunces_500Medium',
    displaySemiBold: 'Fraunces_600SemiBold',
    displayBold: 'Fraunces_700Bold',
    // IBM Plex Mono for data/numbers
    monoRegular: 'IBMPlexMono_400Regular',
    monoMedium: 'IBMPlexMono_500Medium',
    monoSemiBold: 'IBMPlexMono_600SemiBold',
    monoBold: 'IBMPlexMono_700Bold',
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
  sm: 2, // More structured corners
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

// Shadows removed/minimized in favor of hairline rules
export const Shadows = {
  sm: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  md: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  lg: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
