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
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 16,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: "Roboto_400Regular",
    medium: "Roboto_500Medium",
    bold: "Roboto_700Bold",
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

export const shadows = {
  sm: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
} as const;
