import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Info, Ruler, X } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Unit = "in" | "cm";

const SIZE_CHART = [
  { size: "XS", bust: { in: "32-34", cm: "81-86" }, waist: { in: "24-26", cm: "61-66" }, hip: { in: "34-36", cm: "86-91" }, length: { in: "38.5", cm: "98" } },
  { size: "S", bust: { in: "34-36", cm: "86-91" }, waist: { in: "26-28", cm: "66-71" }, hip: { in: "36-38", cm: "91-96" }, length: { in: "39.4", cm: "100" } },
  { size: "M", bust: { in: "36-38", cm: "91-96" }, waist: { in: "28-30", cm: "71-76" }, hip: { in: "38-40", cm: "96-101" }, length: { in: "40.2", cm: "102" } },
  { size: "L", bust: { in: "38-40", cm: "96-101" }, waist: { in: "30-32", cm: "76-81" }, hip: { in: "40-42", cm: "101-106" }, length: { in: "41.0", cm: "104" } },
  { size: "XL", bust: { in: "40-43", cm: "101-109" }, waist: { in: "32-35", cm: "81-89" }, hip: { in: "42-45", cm: "106-114" }, length: { in: "41.7", cm: "106" } },
  { size: "XXL", bust: { in: "43-46", cm: "109-117" }, waist: { in: "35-38", cm: "89-96" }, hip: { in: "45-48", cm: "114-122" }, length: { in: "42.5", cm: "108" } },
];

export function SizeGuideModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [unit, setUnit] = useState<Unit>("cm");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ruler size={18} color={colors.foreground} />
              <Text style={styles.title}>Size Guide</Text>
            </View>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Unit Switcher */}
            <View style={styles.unitSwitcher}>
              <Pressable
                onPress={() => setUnit("cm")}
                style={[styles.unitTab, unit === "cm" && styles.unitTabActive]}
              >
                <Text
                  style={[
                    styles.unitLabel,
                    unit === "cm" && styles.unitLabelActive,
                  ]}
                >
                  Centimeters (cm)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setUnit("in")}
                style={[styles.unitTab, unit === "in" && styles.unitTabActive]}
              >
                <Text
                  style={[
                    styles.unitLabel,
                    unit === "in" && styles.unitLabelActive,
                  ]}
                >
                  Inches (in)
                </Text>
              </Pressable>
            </View>

            {/* Size Table */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colSize]}>Size</Text>
                <Text style={styles.th}>Bust</Text>
                <Text style={styles.th}>Waist</Text>
                <Text style={styles.th}>Hip</Text>
                <Text style={styles.th}>Length</Text>
              </View>

              {SIZE_CHART.map((row, index) => (
                <View
                  key={row.size}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 && styles.tableRowAlt,
                  ]}
                >
                  <Text style={[styles.td, styles.colSize, styles.tdBold]}>
                    {row.size}
                  </Text>
                  <Text style={styles.td}>{row.bust[unit]}</Text>
                  <Text style={styles.td}>{row.waist[unit]}</Text>
                  <Text style={styles.td}>{row.hip[unit]}</Text>
                  <Text style={styles.td}>{row.length[unit]}</Text>
                </View>
              ))}
            </View>

            {/* Fit Tips */}
            <View style={styles.fitBox}>
              <View style={styles.fitHeader}>
                <Info size={16} color="#B45309" />
                <Text style={styles.fitTitle}>Savana Fit Recommendation</Text>
              </View>
              <Text style={styles.fitText}>
                • Regular fit: Fits true to size. If you prefer a relaxed or oversized drape, we recommend ordering one size up.
              </Text>
              <Text style={styles.fitText}>
                • Stretch: Medium stretch fabric tailored to adapt to individual body silhouettes.
              </Text>
            </View>

            {/* How to measure */}
            <View style={styles.measureBox}>
              <Text style={styles.measureTitle}>How to measure</Text>
              <Text style={styles.measureStep}>
                <Text style={styles.measureStepBold}>1. Bust: </Text>
                Measure across the fullest part of your chest with arms relaxed.
              </Text>
              <Text style={styles.measureStep}>
                <Text style={styles.measureStepBold}>2. Waist: </Text>
                Measure around your natural waistline, keeping the tape comfortably loose.
              </Text>
              <Text style={styles.measureStep}>
                <Text style={styles.measureStepBold}>3. Hips: </Text>
                Measure around the fullest part of your hips and seat.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.brandWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D4D4D4",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.foreground,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  unitSwitcher: {
    flexDirection: "row",
    backgroundColor: colors.imagePlaceholder,
    padding: 3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.md,
  },
  unitTabActive: {
    backgroundColor: colors.brandWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  unitLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandGray,
  },
  unitLabelActive: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.brandCream,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  th: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.foreground,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 224, 200, 0.4)",
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "rgba(255, 245, 209, 0.2)",
  },
  td: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.foreground,
    textAlign: "center",
  },
  colSize: {
    flex: 0.8,
  },
  tdBold: {
    fontFamily: typography.fontFamily.bold,
  },
  fitBox: {
    backgroundColor: "rgba(255, 191, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.3)",
    padding: 14,
    borderRadius: radius.lg,
    gap: 6,
  },
  fitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  fitTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: "#92400E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fitText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.foreground,
    lineHeight: 18,
  },
  measureBox: {
    gap: 6,
    paddingTop: 4,
  },
  measureTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
    marginBottom: 4,
  },
  measureStep: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.brandGray,
    lineHeight: 18,
  },
  measureStepBold: {
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
});
