import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

export function Skeleton({
  height = 16,
  width = "100%",
  style,
}: {
  height?: number;
  width?: number | `${number}%`;
  style?: object;
}) {
  return <View style={[styles.base, { height, width }, style]} />;
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={140} />
      <View style={styles.body}>
        <Skeleton height={12} width="40%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="50%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.25)",
    backgroundColor: colors.productCard,
    overflow: "hidden",
  },
  body: {
    gap: spacing.sm,
    padding: spacing.md,
  },
});
