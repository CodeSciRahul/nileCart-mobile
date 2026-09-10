import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, typography } from "@/theme";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  loading,
  disabled,
  variant = "primary",
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.primaryForeground : colors.foreground}
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as const]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.brandAmber,
  },
  secondary: {
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.35)",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: colors.destructive,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
  },
  primaryLabel: {
    color: colors.primaryForeground,
  },
  secondaryLabel: {
    color: colors.foreground,
  },
  ghostLabel: {
    color: colors.foreground,
  },
  destructiveLabel: {
    color: colors.brandWhite,
  },
});
