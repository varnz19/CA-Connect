// CA Connect Design System — Ledger-Adjacent Visual Language
//
// TYPOGRAPHY RULE: IBM Plex Mono is STRICTLY for numbers — amounts,
// invoice numbers, dates, GSTIN/PAN, timestamps. Montserrat for all
// UI labels, body text, headings, and navigation.

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

  // Hairline rules — low-opacity ink for structural separation
  hairline: 'rgba(20, 38, 30, 0.12)',

  // Status & Actions
  success: '#1F3D2E',       // Using ink-700 for success (official)
  successLight: '#EFE3C8',
  successDark: '#14261E',

  warning: '#B8863A',       // brass
  warningLight: '#EFE3C8',
  warningDark: '#8A652B',

  danger: '#A34B34',        // --rust (desaturated, not alarm-red)
  dangerLight: '#FDECE8',
  dangerDark: '#7A3827',

  info: '#1F3D2E',          // ink-700
  infoLight: '#EFE3C8',
  infoDark: '#14261E',

  // Borders & Rules
  border: '#DAD9CE',        // --rule
  borderLight: '#EBEBE4',
  borderFocus: '#B8863A',   // Brass for focus states (underline inputs)

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
  tabBarBackground: '#FBFBF8', // paper-card (not ink — calmer)
  tabBarActive: '#B8863A',     // --brass accent
  tabBarInactive: '#8A9590',   // --text-tertiary
} as const;

export const Typography = {
  // Font families
  fontFamily: {
    // Montserrat for ALL UI text
    regular: 'Montserrat_400Regular',
    medium: 'Montserrat_500Medium',
    semiBold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
    // Montserrat for display/headings
    displayRegular: 'Montserrat_400Regular',
    displayMedium: 'Montserrat_500Medium',
    displaySemiBold: 'Montserrat_600SemiBold',
    displayBold: 'Montserrat_700Bold',
    // IBM Plex Mono — ONLY for numbers: amounts, invoice numbers,
    // dates, GSTIN/PAN, timestamps, reference codes
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

// Consistent 4px radius everywhere — no mixed radii
export const BorderRadius = {
  sm: 4,
  md: 4,
  lg: 4,
  xl: 4,
  '2xl': 4,
  full: 9999, // only for notification dots / avatars
} as const;

// No shadows — separation via hairline rules and borders only
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
