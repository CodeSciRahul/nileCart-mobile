import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { AlertCircle, Check, Ruler } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";
import { SizeGuideModal } from "./SizeGuideModal";
import { getStockState } from "@/utils/product";
import { getImageUrl } from "@/utils/format";
import type { ProductVariant } from "@/types/models";

export type ColorOption = {
  key: string;
  color: string;
  colorHex: string;
  variants: ProductVariant[];
};

type Props = {
  colorOptions: ColorOption[];
  activeColorKey: string | null;
  onSelectColor: (colorKey: string) => void;
  sizeVariants: ProductVariant[];
  selectedSku: string | null;
  onSelectSku: (sku: string) => void;
  hasSizeError?: boolean;
};

export function ProductVariantsSelector({
  colorOptions,
  activeColorKey,
  onSelectColor,
  sizeVariants,
  selectedSku,
  onSelectSku,
  hasSizeError = false,
}: Props) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const activeColor =
    colorOptions.find((c) => c.key === activeColorKey) || colorOptions[0];
  const activeVariant =
    sizeVariants.find((v) => v.sku === selectedSku) || sizeVariants[0];

  return (
    <View style={styles.container}>
      {/* Color Selection */}
      {colorOptions.length > 1 ? (
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>
              Color: <Text style={styles.valueHighlight}>{activeColor?.color}</Text>
            </Text>
            <Text style={styles.optionCount}>
              {colorOptions.length} available
            </Text>
          </View>

          <View style={styles.swatches}>
            {colorOptions.map((option) => {
              const isActive = (activeColorKey || colorOptions[0]?.key) === option.key;
              const firstVariantImage = option.variants[0]?.images?.[0];
              const imageUrl = firstVariantImage ? getImageUrl(firstVariantImage) : null;

              return (
                <Pressable
                  key={option.key}
                  accessibilityLabel={`Select color ${option.color}`}
                  accessibilityRole="button"
                  onPress={() => onSelectColor(option.key)}
                  style={[
                    styles.swatchCard,
                    isActive && styles.swatchCardActive,
                  ]}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.swatchThumbnail}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: option.colorHex || "#d4d4d4" },
                      ]}
                    >
                      {isActive ? (
                        <Check size={12} color={colors.foreground} strokeWidth={3} />
                      ) : null}
                    </View>
                  )}
                  <Text
                    style={[
                      styles.swatchColorLabel,
                      isActive && styles.swatchColorLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {option.color}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Size Selection */}
      {sizeVariants.length > 0 ? (
        <View style={[styles.section, hasSizeError && styles.sectionError]}>
          <View style={styles.headerRow}>
            <View style={styles.sizeTitleRow}>
              <Text style={styles.label}>
                Select Size
                {activeVariant?.size ? (
                  <Text style={styles.valueHighlight}>: {activeVariant.size}</Text>
                ) : null}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Open size guide"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setSizeGuideOpen(true)}
              style={styles.sizeGuideBtn}
            >
              <Ruler size={14} color={colors.foreground} />
              <Text style={styles.sizeGuideText}>Size Guide</Text>
            </Pressable>
          </View>

          {hasSizeError ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={14} color={colors.destructive} />
              <Text style={styles.errorBannerText}>
                Please select a size to continue
              </Text>
            </View>
          ) : null}

          <View style={styles.sizes}>
            {sizeVariants.map((variant) => {
              const stockState = getStockState(variant.stock);
              const isOos = stockState.key === "oos";
              const isActive = (selectedSku || activeVariant?.sku) === variant.sku;
              const displayLabel = variant.size || variant.sku;

              return (
                <Pressable
                  key={variant.sku}
                  accessibilityLabel={`Size ${displayLabel}${isOos ? ", out of stock" : ""}`}
                  accessibilityRole="button"
                  disabled={isOos}
                  onPress={() => onSelectSku(variant.sku)}
                  style={[
                    styles.sizeChip,
                    isActive && styles.sizeChipActive,
                    isOos && styles.sizeChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeLabel,
                      isActive && styles.sizeLabelActive,
                      isOos && styles.sizeLabelDisabled,
                    ]}
                  >
                    {displayLabel}
                  </Text>

                  {isOos ? (
                    <View style={styles.oosStrikethrough} pointerEvents="none" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Size Guide Modal */}
      <SizeGuideModal
        visible={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
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
    gap: 16,
  },
  section: {
    gap: 10,
  },
  sectionError: {
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: "rgba(220, 38, 38, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sizeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  valueHighlight: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  optionCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  swatchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brandWhite,
  },
  swatchCardActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandCream,
    shadowColor: colors.brandAmber,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  swatchThumbnail: {
    width: 24,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.imagePlaceholder,
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchColorLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.foreground,
  },
  swatchColorLabelActive: {
    fontFamily: typography.fontFamily.bold,
  },
  sizeGuideBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 245, 209, 0.6)",
  },
  sizeGuideText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.foreground,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  errorBannerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.destructive,
  },
  sizes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeChip: {
    minWidth: 54,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandWhite,
    position: "relative",
  },
  sizeChipActive: {
    borderColor: colors.foreground,
    backgroundColor: colors.foreground,
  },
  sizeChipDisabled: {
    borderColor: "#E5E5E5",
    backgroundColor: "#F9F9F9",
    opacity: 0.5,
  },
  sizeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  sizeLabelActive: {
    fontFamily: typography.fontFamily.bold,
    color: colors.brandWhite,
  },
  sizeLabelDisabled: {
    color: "#A3A3A3",
  },
  oosStrikethrough: {
    position: "absolute",
    width: "80%",
    height: 1,
    backgroundColor: "#A3A3A3",
    transform: [{ rotate: "-24deg" }],
  },
});
