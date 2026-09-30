import { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftSlot?: React.ReactNode;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, containerStyle, leftSlot, style, ...rest },
  ref
) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {leftSlot}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, leftSlot ? styles.inputWithIcon : null, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  field: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  fieldError: {
    borderColor: colors.destructive,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    color: colors.foreground,
    paddingVertical: spacing.md,
  },
  inputWithIcon: {
    marginLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.destructive,
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
  },
});
