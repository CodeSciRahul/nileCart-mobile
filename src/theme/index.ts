import { colors } from "./colors";

export { colors } from "./colors";

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  "2xl": 12,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    semibold: "DMSans_600SemiBold",
    bold: "DMSans_700Bold",
    display: "Syne_700Bold",
    displayMedium: "Syne_600SemiBold",
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const textStyles = {
  display: {
    fontFamily: typography.fontFamily.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  screenTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: colors.foreground,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.15,
    color: colors.foreground,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.foreground,
  },
  productTitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brandGray,
  },
  pdpTitle: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.foreground,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    color: colors.foreground,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.foreground,
  },
  bodySecondary: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.brandGray,
  },
  caption: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.brandStone,
  },
  price: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.foreground,
  },
  priceLarge: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.foreground,
  },
  priceStruck: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brandStone,
    textDecorationLine: "line-through" as const,
  },
  discount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.brandAmber,
  },
  button: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    letterSpacing: 0.4,
    color: colors.primaryForeground,
  },
  input: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    color: colors.foreground,
  },
  nav: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.2,
    color: colors.brandGray,
  },
  badge: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.foreground,
  },
  error: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.destructive,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  textStyles,
  shadows,
} as const;
