import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Copy, Percent, Tag } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";
import { useUiStore } from "@/store/uiStore";

export function ProductOffers() {
  const showToast = useUiStore((s) => s.showToast);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied!`, "success");
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Tag size={16} color={colors.foreground} />
          <Text style={styles.title}>Exclusive Offers</Text>
        </View>
        <Text style={styles.badge}>2 AVAILABLE</Text>
      </View>

      {/* Coupon 1 */}
      <View style={styles.couponCard}>
        <View style={styles.couponLeft}>
          <View style={styles.percentBadge}>
            <Percent size={14} color={colors.foreground} />
          </View>
          <View style={styles.couponDetails}>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>NILE15</Text>
              <Text style={styles.discountHighlight}>• 15% OFF</Text>
            </View>
            <Text style={styles.couponDescription}>
              Valid on orders above UGX 80,000. Maximum discount UGX 25,000.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Copy coupon code NILE15"
          accessibilityRole="button"
          onPress={() => handleCopy("NILE15")}
          style={[
            styles.copyBtn,
            copiedCode === "NILE15" && styles.copyBtnSuccess,
          ]}
        >
          {copiedCode === "NILE15" ? (
            <>
              <Check size={12} color={colors.success} strokeWidth={2.5} />
              <Text style={[styles.copyBtnText, { color: colors.success }]}>
                Copied
              </Text>
            </>
          ) : (
            <>
              <Copy size={12} color={colors.foreground} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Coupon 2 */}
      <View style={[styles.couponCard, styles.couponCardAlt]}>
        <View style={styles.couponLeft}>
          <View style={[styles.percentBadge, { backgroundColor: "#DCFCE7" }]}>
            <Percent size={14} color={colors.success} />
          </View>
          <View style={styles.couponDetails}>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>FREESHIP</Text>
              <Text style={[styles.discountHighlight, { color: colors.success }]}>
                • FREE DELIVERY
              </Text>
            </View>
            <Text style={styles.couponDescription}>
              Applicable automatically on standard doorstep delivery.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Copy coupon code FREESHIP"
          accessibilityRole="button"
          onPress={() => handleCopy("FREESHIP")}
          style={[
            styles.copyBtn,
            copiedCode === "FREESHIP" && styles.copyBtnSuccess,
          ]}
        >
          {copiedCode === "FREESHIP" ? (
            <>
              <Check size={12} color={colors.success} strokeWidth={2.5} />
              <Text style={[styles.copyBtnText, { color: colors.success }]}>
                Copied
              </Text>
            </>
          ) : (
            <>
              <Copy size={12} color={colors.foreground} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.5)",
    backgroundColor: colors.brandWhite,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  badge: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    color: "#B45309",
    backgroundColor: colors.brandCream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    letterSpacing: 0.5,
  },
  couponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.35)",
    backgroundColor: "rgba(255, 245, 209, 0.35)",
    gap: 12,
  },
  couponCardAlt: {
    borderColor: "rgba(22, 163, 74, 0.25)",
    backgroundColor: "rgba(240, 253, 244, 0.5)",
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  percentBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandAmber,
    alignItems: "center",
    justifyContent: "center",
  },
  couponDetails: {
    flex: 1,
    gap: 2,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  codeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
    letterSpacing: 0.8,
  },
  discountHighlight: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: "#B45309",
  },
  couponDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
    lineHeight: 15,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colors.brandWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyBtnSuccess: {
    borderColor: colors.success,
    backgroundColor: "#F0FDF4",
  },
  copyBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.foreground,
  },
});
