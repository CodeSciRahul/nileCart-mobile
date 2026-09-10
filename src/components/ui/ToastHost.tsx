import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUiStore } from "@/store/uiStore";
import { colors, radius, spacing, typography } from "@/theme";

export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clearToast, 2800);
    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <Pressable
      onPress={clearToast}
      style={[
        styles.toast,
        {
          top: insets.top + spacing.sm,
          backgroundColor:
            toast.type === "error" ? colors.destructive : colors.foreground,
        },
      ]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    color: colors.brandWhite,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
});
