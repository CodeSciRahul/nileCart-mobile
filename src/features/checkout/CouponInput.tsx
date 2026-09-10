import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Tag, X } from "lucide-react-native";
import { queryKeys } from "@/constants/queryKeys";
import {
  applyCouponToCart,
  removeCartCoupon,
  validateCoupon,
} from "@/services/couponService";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatMoney } from "@/utils/format";
import { colors, spacing, typography } from "@/theme";

type AppliedCoupon = {
  code?: string;
  description?: string;
} | null;

type Props = {
  appliedCoupon?: AppliedCoupon;
  subtotal?: number;
  currency?: string;
  disabled?: boolean;
};

export function CouponInput({
  appliedCoupon,
  subtotal = 0,
  currency = "UGX",
  disabled,
}: Props) {
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.cart });

  const validateMutation = useMutation({
    mutationFn: ({ code: c, orderAmount }: { code: string; orderAmount: number }) =>
      validateCoupon(c, orderAmount),
    onSuccess: (data) => {
      setPreview(
        `You save ${formatMoney(data.discount, currency)} with ${data.coupon?.code || code}`
      );
    },
    onError: (error: unknown) => {
      setPreview(null);
      showToast(
        error instanceof Error ? error.message : "Could not validate coupon.",
        "error"
      );
    },
  });

  const applyMutation = useMutation({
    mutationFn: (c: string) => applyCouponToCart(c),
    onSuccess: async () => {
      setCode("");
      setPreview(null);
      await invalidateCart();
      showToast("Coupon applied", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not apply coupon.",
        "error"
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeCartCoupon,
    onSuccess: async () => {
      setCode("");
      setPreview(null);
      await invalidateCart();
      showToast("Coupon removed", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not remove coupon.",
        "error"
      );
    },
  });

  const pending =
    validateMutation.isPending ||
    applyMutation.isPending ||
    removeMutation.isPending ||
    disabled;

  if (appliedCoupon?.code) {
    return (
      <View style={styles.applied}>
        <View style={styles.appliedLeft}>
          <View style={styles.iconWrap}>
            <Check size={14} color={colors.foreground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appliedEyebrow}>Coupon applied</Text>
            <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
            {appliedCoupon.description ? (
              <Text style={styles.appliedDesc}>{appliedCoupon.description}</Text>
            ) : null}
          </View>
        </View>
        <Pressable
          accessibilityLabel="Remove coupon"
          disabled={pending}
          onPress={() => removeMutation.mutate()}
          hitSlop={8}
        >
          <X size={18} color={colors.brandGray} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Tag size={13} color={colors.brandAmber} />
        <Text style={styles.label}>Have a coupon?</Text>
      </View>
      <Input
        value={code}
        onChangeText={(value) => {
          setCode(value.toUpperCase());
          setPreview(null);
        }}
        placeholder="Enter code"
        autoCapitalize="characters"
        editable={!pending}
      />
      <View style={styles.actions}>
        <Button
          title="Check"
          variant="secondary"
          disabled={pending || !code.trim()}
          loading={validateMutation.isPending}
          onPress={() =>
            validateMutation.mutate({
              code: code.trim(),
              orderAmount: subtotal,
            })
          }
          style={styles.half}
        />
        <Button
          title="Apply"
          disabled={pending || !code.trim()}
          loading={applyMutation.isPending}
          onPress={() => applyMutation.mutate(code.trim())}
          style={styles.half}
        />
      </View>
      {preview ? <Text style={styles.preview}>{preview}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
  preview: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.success,
  },
  applied: {
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.35)",
    backgroundColor: "rgba(255, 245, 209, 0.7)",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  appliedLeft: { flex: 1, flexDirection: "row", gap: spacing.sm },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 191, 0, 0.25)",
  },
  appliedEyebrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    color: colors.brandGray,
    textTransform: "uppercase",
  },
  appliedCode: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  appliedDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
});
