import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react-native";
import { colors, radius, typography } from "@/theme";

export function ProductServices() {
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState<string | null>(null);

  const handleCheck = () => {
    if (pincode.trim().length >= 3) {
      setCheckedPincode(pincode.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* Delivery Estimator */}
      <View style={styles.deliveryBlock}>
        <View style={styles.deliveryHeader}>
          <MapPin size={16} color={colors.foreground} />
          <Text style={styles.blockTitle}>Delivery Options</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Enter Delivery Pincode"
            placeholderTextColor={colors.brandGray}
            value={pincode}
            onChangeText={(text) => {
              setPincode(text);
              if (checkedPincode) setCheckedPincode(null);
            }}
            keyboardType="number-pad"
            maxLength={8}
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="Check delivery availability for pincode"
            accessibilityRole="button"
            onPress={handleCheck}
            disabled={pincode.trim().length < 3}
            style={({ pressed }) => [
              styles.checkBtn,
              pincode.trim().length < 3 && styles.checkBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.checkBtnText}>Check</Text>
          </Pressable>
        </View>

        {checkedPincode ? (
          <View style={styles.estimateResult}>
            <CheckCircle2 size={15} color={colors.success} />
            <Text style={styles.estimateText}>
              Delivery to <Text style={styles.boldText}>{checkedPincode}</Text> available by{" "}
              <Text style={styles.boldText}>Friday, 3 PM</Text> • Free Shipping
            </Text>
          </View>
        ) : (
          <Text style={styles.estimateHint}>
            Please enter your postal code to verify delivery speed & COD availability.
          </Text>
        )}
      </View>

      {/* Savana 4 Guarantees Strip */}
      <View style={styles.guaranteesGrid}>
        <View style={styles.guaranteeItem}>
          <View style={styles.guaranteeIcon}>
            <Truck size={18} color={colors.warning} />
          </View>
          <View style={styles.guaranteeTexts}>
            <Text style={styles.guaranteeTitle}>Fast Delivery</Text>
            <Text style={styles.guaranteeSub}>2 - 4 business days</Text>
          </View>
        </View>

        <View style={styles.guaranteeItem}>
          <View style={styles.guaranteeIcon}>
            <RotateCcw size={18} color={colors.warning} />
          </View>
          <View style={styles.guaranteeTexts}>
            <Text style={styles.guaranteeTitle}>7-Day Returns</Text>
            <Text style={styles.guaranteeSub}>Easy doorstep pickup</Text>
          </View>
        </View>

        <View style={styles.guaranteeItem}>
          <View style={styles.guaranteeIcon}>
            <ShieldCheck size={18} color={colors.warning} />
          </View>
          <View style={styles.guaranteeTexts}>
            <Text style={styles.guaranteeTitle}>100% Genuine</Text>
            <Text style={styles.guaranteeSub}>Certified quality</Text>
          </View>
        </View>

        <View style={styles.guaranteeItem}>
          <View style={styles.guaranteeIcon}>
            <CreditCard size={18} color={colors.warning} />
          </View>
          <View style={styles.guaranteeTexts}>
            <Text style={styles.guaranteeTitle}>Pay on Delivery</Text>
            <Text style={styles.guaranteeSub}>Cash or Mobile Pay</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.brandWhite,
    gap: 16,
  },
  deliveryBlock: {
    gap: 8,
  },
  deliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  blockTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  checkBtn: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: colors.brandAmber,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnDisabled: {
    opacity: 0.5,
  },
  checkBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
    color: colors.foreground,
    letterSpacing: 0.5,
  },
  estimateResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.successMuted,
    padding: 8,
    borderRadius: radius.md,
  },
  estimateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.foreground,
    flex: 1,
  },
  estimateHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
  },
  boldText: {
    fontFamily: typography.fontFamily.bold,
  },
  guaranteesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 4,
  },
  guaranteeItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.creamSoft,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.amberRing,
  },
  guaranteeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandCream,
    alignItems: "center",
    justifyContent: "center",
  },
  guaranteeTexts: {
    flex: 1,
  },
  guaranteeTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.foreground,
  },
  guaranteeSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: colors.brandGray,
    marginTop: 1,
  },
});
