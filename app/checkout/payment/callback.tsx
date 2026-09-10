import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { verifyPayment } from "@/services/checkoutService";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@/theme";

type UiState =
  | { status: "loading"; message: string }
  | { status: "error" | "cancelled"; message: string }
  | { status: "success"; message?: string; orderId?: string; orderNumber?: string };

const MISSING_REF =
  "Missing payment reference. Contact support if you were charged.";

export default function PaymentCallbackScreen() {
  const params = useLocalSearchParams<{
    tx_ref?: string;
    txRef?: string;
    transaction_id?: string;
    transactionId?: string;
    status?: string;
  }>();
  const queryClient = useQueryClient();
  const attempted = useRef(false);

  const txRef = params.tx_ref || params.txRef || "";
  const transactionId = params.transaction_id || params.transactionId;
  const redirectStatus = params.status;

  const [state, setState] = useState<UiState>(() =>
    txRef
      ? { status: "loading", message: "Verifying your payment…" }
      : { status: "error", message: MISSING_REF }
  );

  useEffect(() => {
    if (attempted.current || !txRef) return;
    attempted.current = true;

    const run = async () => {
      try {
        if (redirectStatus === "cancelled" || redirectStatus === "canceled") {
          const data = await verifyPayment({
            txRef,
            transactionId,
            status: "cancelled",
          });
          await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
          setState({
            status: "cancelled",
            message: data.cancelled
              ? "Payment was cancelled. Your order was not confirmed and stock has been restored."
              : "Payment was cancelled.",
          });
          return;
        }

        const data = await verifyPayment({ txRef, transactionId });
        await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        await queryClient.invalidateQueries({ queryKey: queryKeys.orders({}) });

        if (data.failed) {
          setState({
            status: "error",
            message:
              "Payment failed. Your order was cancelled and stock restored.",
          });
          return;
        }

        if (data.paid || data.alreadyPaid) {
          router.replace({
            pathname: "/checkout/success",
            params: {
              orderId: data.order?._id || "",
              orderNumber: data.order?.orderNumber || "",
              paymentMethod: "online",
            },
          });
          return;
        }

        setState({
          status: "error",
          message: "Payment could not be confirmed. Check your Orders.",
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Payment verification failed.",
        });
      }
    };

    run();
  }, [txRef, transactionId, redirectStatus, queryClient]);

  return (
    <View style={styles.screen}>
      {state.status === "loading" ? (
        <ActivityIndicator color={colors.brandAmber} size="large" />
      ) : null}
      <Text style={styles.title}>
        {state.status === "loading"
          ? "Verifying payment"
          : state.status === "cancelled"
            ? "Payment cancelled"
            : "Payment issue"}
      </Text>
      <Text style={styles.body}>{state.message || ""}</Text>
      {state.status !== "loading" ? (
        <View style={styles.actions}>
          <Button title="Back to bag" onPress={() => router.replace("/(tabs)/cart")} />
          <Button
            title="View orders"
            variant="secondary"
            onPress={() => router.replace("/account/orders")}
          />
        </View>
      ) : null}
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
    fontSize: typography.size.xl,
    color: colors.foreground,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.brandGray,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
