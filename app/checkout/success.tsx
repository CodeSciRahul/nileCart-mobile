import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@/theme";

export default function CheckoutSuccessRoute() {
  const { orderNumber, orderId } = useLocalSearchParams<{
    orderNumber?: string;
    orderId?: string;
  }>();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Order confirmed</Text>
      <Text style={styles.body}>
        {orderNumber
          ? `Your order ${orderNumber} has been placed.`
          : "Your order has been placed successfully."}
      </Text>
      {orderId ? (
        <Text style={styles.meta}>Reference: {orderId}</Text>
      ) : null}
      <Button
        title="Continue shopping"
        onPress={() => router.replace("/(tabs)")}
        style={styles.btn}
      />
      <Button
        title="View orders"
        variant="secondary"
        onPress={() => router.replace("/account/orders")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing["2xl"],
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    color: colors.brandGray,
    lineHeight: 22,
  },
  meta: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  btn: { marginTop: spacing.lg },
});
