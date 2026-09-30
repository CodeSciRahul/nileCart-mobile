import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";
import type { Product, ProductVariant } from "@/types/models";

type Props = {
  product: Product;
  selectedVariant?: ProductVariant;
};

export function ProductAccordion({ product, selectedVariant }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    specifications: false,
    shipping: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const specs = [
    { label: "Brand", value: product.brand || "Nilescart Studio" },
    { label: "Category", value: product.category?.name || "Apparel" },
    { label: "Fit Type", value: "Regular Contemporary Fit" },
    { label: "Material", value: "95% Premium Cotton, 5% Elastane" },
    { label: "Pattern", value: "Modern Minimalist" },
    { label: "Care Instructions", value: "Machine wash cold with like colors, do not bleach" },
    { label: "Origin", value: "Imported / Quality Inspected" },
    { label: "SKU", value: selectedVariant?.sku || product.slug || "NC-PRODUCT" },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Description Accordion */}
      <View style={styles.accordionItem}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle product description"
          onPress={() => toggleSection("description")}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>Product Description</Text>
          {openSections.description ? (
            <ChevronUp size={18} color={colors.foreground} />
          ) : (
            <ChevronDown size={18} color={colors.foreground} />
          )}
        </Pressable>

        {openSections.description ? (
          <View style={styles.accordionBody}>
            <Text style={styles.descriptionText}>
              {product.description ||
                "Engineered with an eye for modern silhouettes and effortless comfort. Designed to flatter every body line while offering exceptional durability for day-to-night versatility."}
            </Text>

            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • High-retention premium fabric for long-lasting shape
              </Text>
              <Text style={styles.bulletItem}>
                • Breathable, lightweight drape ideal for all-day styling
              </Text>
              <Text style={styles.bulletItem}>
                • Precision reinforced stitching at stress points
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* 2. Specifications Accordion */}
      <View style={styles.accordionItem}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle product specifications"
          onPress={() => toggleSection("specifications")}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>Specifications & Details</Text>
          {openSections.specifications ? (
            <ChevronUp size={18} color={colors.foreground} />
          ) : (
            <ChevronDown size={18} color={colors.foreground} />
          )}
        </Pressable>

        {openSections.specifications ? (
          <View style={styles.accordionBody}>
            <View style={styles.specGrid}>
              {specs.map((spec, index) => (
                <View
                  key={spec.label}
                  style={[
                    styles.specRow,
                    index % 2 === 1 && styles.specRowAlt,
                  ]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* 3. Shipping & Return Policy Accordion */}
      <View style={[styles.accordionItem, styles.accordionItemLast]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle shipping and return policy"
          onPress={() => toggleSection("shipping")}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>Shipping & Easy Returns</Text>
          {openSections.shipping ? (
            <ChevronUp size={18} color={colors.foreground} />
          ) : (
            <ChevronDown size={18} color={colors.foreground} />
          )}
        </Pressable>

        {openSections.shipping ? (
          <View style={styles.accordionBody}>
            <Text style={styles.policyTitle}>7-Day Doorstep Returns & Exchanges</Text>
            <Text style={styles.policyText}>
              We want you to love your purchase! If the size doesn't fit or you're not completely satisfied, initiate a free return or exchange within 7 days of delivery.
            </Text>

            <Text style={styles.policyTitle}>Free Shipping Guarantee</Text>
            <Text style={styles.policyText}>
              Enjoy free standard delivery on qualifying orders. Real-time courier tracking is provided as soon as your parcel is dispatched.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brandWhite,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.5)",
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.35)",
  },
  accordionItemLast: {
    borderBottomWidth: 0,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accordionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.foreground,
    lineHeight: 22,
  },
  bulletList: {
    gap: 4,
    marginTop: 4,
  },
  bulletItem: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.brandGray,
    lineHeight: 18,
  },
  specGrid: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.35)",
  },
  specRowAlt: {
    backgroundColor: "rgba(255, 245, 209, 0.15)",
  },
  specLabel: {
    width: "40%",
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.brandGray,
  },
  specValue: {
    width: "60%",
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.foreground,
  },
  policyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.foreground,
    marginTop: 4,
  },
  policyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.brandGray,
    lineHeight: 18,
  },
});
