// CA Connect Design System — Modern, Vibrant & High-Contrast Visual Language
//
// TYPOGRAPHY RULE: Inter is the uniform font for ALL text — headings, body,
// labels, amounts, numbers, dates, codes, and navigation.

export const Colors = {
  // Brand Core Colors — Modern Sapphire & Indigo
  primary: '#1E40AF',       // Deep Royal Sapphire
  primaryLight: '#2563EB',  // Vibrant Royal Blue
  primarySoft: '#EFF6FF',   // Soft Ice Blue Tint
  primaryDark: '#1E3A8A',   // Navy Indigo

  // Vibrant Secondary / Gold Accent
  secondary: '#F59E0B',     // Vibrant Warm Amber / Gold
  secondaryLight: '#FEF3C7',// Soft Amber Tint
  secondaryDark: '#D97706', // Deep Amber

  // Clean, Crisp Modern Backgrounds & Good White
  background: '#F8FAFC',    // Slate-50: Luminous, fresh modern canvas
  backgroundCard: '#FFFFFF',// Pristine Crisp White
  backgroundInput: '#FFFFFF',
  backgroundSubtle: '#F1F5F9', // Slate-100

  // High-Contrast Modern Typography
  textPrimary: '#0F172A',   // Slate-900: Rich, high-contrast dark slate
  textSecondary: '#475569', // Slate-600: Balanced subtitle & metadata
  textTertiary: '#94A3B8',  // Slate-400: Placeholders & muted hints
  textLight: '#FFFFFF',     // Pure White
  textMuted: '#CBD5E1',     // Slate-300

  // Hairlines & Separators
  hairline: '#E2E8F0',

  // Status & Semantic Palette — Colorful, Vivid & Expressive
  success: '#10B981',       // Vibrant Emerald Green
  successLight: '#ECFDF5',  // Mint 50
  successBorder: '#A7F3D0', // Mint 200
  successDark: '#047857',

  warning: '#F59E0B',       // Vibrant Amber
  warningLight: '#FFFBEB',  // Amber 50
  warningBorder: '#FDE68A', // Amber 200
  warningDark: '#B45309',

  danger: '#EF4444',        // Vibrant Coral Red
  dangerLight: '#FEF2F2',   // Red 50
  dangerBorder: '#FECACA',  // Red 200
  dangerDark: '#DC2626',

  info: '#0EA5E9',          // Vibrant Sky Cyan
  infoLight: '#F0F9FF',     // Sky 50
  infoBorder: '#BAE6FD',    // Sky 200
  infoDark: '#0284C7',

  purple: '#8B5CF6',        // Vibrant Violet
  purpleLight: '#F5F3FF',   // Purple 50
  purpleBorder: '#DDD6FE',  // Purple 200
  purpleDark: '#6D28D9',

  // Borders & Dividers
  border: '#E2E8F0',        // Slate-200
  borderLight: '#F1F5F9',   // Slate-100
  borderFocus: '#2563EB',   // Focus ring blue

  divider: '#E2E8F0',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.2)',

  // Status-specific colorful badge backgrounds & text
  statusPending: '#FFFBEB',
  statusPendingText: '#D97706',
  statusPaid: '#ECFDF5',
  statusPaidText: '#059669',
  statusOverdue: '#FEF2F2',
  statusOverdueText: '#DC2626',
  statusActive: '#EFF6FF',
  statusActiveText: '#2563EB',
  statusCompleted: '#ECFDF5',
  statusCompletedText: '#059669',
  statusCancelled: '#F1F5F9',
  statusCancelledText: '#64748B',

  // Tab Bar
  tabBarBackground: '#FFFFFF', // Crisp pure white
  tabBarActive: '#2563EB',     // Vibrant royal blue
  tabBarInactive: '#94A3B8',   // Slate-400
} as const;

export const Typography = {
  // Uniform Typography System — Inter across ALL headings, body, labels, amounts, cards & navigation
  fontFamily: {
    // Inter UI Text
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',

    // Display & Headings
    displayRegular: 'Inter_400Regular',
    displayMedium: 'Inter_500Medium',
    displaySemiBold: 'Inter_600SemiBold',
    displayBold: 'Inter_700Bold',

    // Numbers, Amounts, Dates & Codes (Uniform Inter tabular styling)
    monoRegular: 'Inter_400Regular',
    monoMedium: 'Inter_500Medium',
    monoSemiBold: 'Inter_600SemiBold',
    monoBold: 'Inter_700Bold',
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

// Modern, friendly border radii
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Soft, modern, refined card shadows
export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

