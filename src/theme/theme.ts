export const colors = {
  background: '#0A0D0B',
  surface: '#12160F',
  surfaceRaised: '#161C15',
  border: '#232B22',
  borderMuted: '#1A201A',
  accent: '#5FDB77',
  accentDim: 'rgba(95, 219, 119, 0.16)',
  accentBorder: 'rgba(95, 219, 119, 0.45)',
  textPrimary: '#F4F6F2',
  textSecondary: '#9AA79B',
  textMuted: '#6E786D',
  danger: '#E0725F',
  avatarPalette: ['#2F6B4A', '#3B3E7A', '#7A3B44', '#5A5A5A', '#7A6A2F', '#2F5A7A'],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontFamily: 'serif',
    fontSize: 30,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
} as const;
