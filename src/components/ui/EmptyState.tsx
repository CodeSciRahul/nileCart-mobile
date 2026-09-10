import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@/theme";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing["4xl"],
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
    textAlign: "center",
  },
  description: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.md,
    minWidth: 160,
  },
});
