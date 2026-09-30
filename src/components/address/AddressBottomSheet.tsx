import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Building2, Check, Home, MapPin, X } from "lucide-react-native";
import { createAddress } from "@/services/checkoutService";
import { queryKeys } from "@/constants/queryKeys";
import { useUiStore } from "@/store/uiStore";
import { colors, radius, spacing, textStyles, typography } from "@/theme";
import type { Address } from "@/types/models";

const ADDRESS_TYPES = [
  { label: "Home", value: "Home" as const, icon: Home },
  { label: "Work", value: "Work" as const, icon: Briefcase },
  { label: "Other", value: "Other" as const, icon: Building2 },
];

export type AddressBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (address?: Address) => void;
};

type FormErrors = {
  fullName?: string;
  mobileNumber?: string;
  pincode?: string;
  addressLine?: string;
  city?: string;
  state?: string;
};

export function AddressBottomSheet({
  visible,
  onClose,
  onSuccess,
}: AddressBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const showToast = useUiStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Uganda");
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setFullName("");
    setMobileNumber("");
    setPincode("");
    setAddressLine("");
    setLocality("");
    setCity("");
    setState("");
    setCountry("Uganda");
    setAddressType("Home");
    setIsDefault(false);
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      nextErrors.fullName = "Full name is required (min 2 characters)";
    }

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length < 9) {
      nextErrors.mobileNumber = "Enter a valid mobile number (min 9 digits)";
    }

    if (!pincode.trim() || pincode.trim().length < 3) {
      nextErrors.pincode = "Enter a valid postal / pincode";
    }

    if (!addressLine.trim() || addressLine.trim().length < 5) {
      nextErrors.addressLine = "Street address is required (min 5 characters)";
    }

    if (!city.trim() || city.trim().length < 2) {
      nextErrors.city = "City is required";
    }

    if (!state.trim() || state.trim().length < 2) {
      nextErrors.state = "State / Region is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      createAddress({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        pincode: pincode.trim(),
        addressLine: addressLine.trim(),
        locality: locality.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        country: country.trim() || "Uganda",
        addressType,
        isDefault,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      showToast("Address added successfully!", "success");
      resetForm();
      onClose();
      onSuccess?.(data.address);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not save address.";
      showToast(message, "error");
    },
  });

  const handleSubmit = () => {
    if (mutation.isPending) return;
    if (validate()) {
      mutation.mutate();
    }
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.scrim}
          onPress={handleClose}
          accessibilityLabel="Close bottom sheet"
          accessibilityRole="button"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.sheetContainer}>
            {/* Drag Handle Indicator */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconBox}>
                  <MapPin size={20} color={colors.brandInk} strokeWidth={2.2} />
                </View>
                <View style={styles.headerTextCol}>
                  <Text style={styles.title}>Add New Address</Text>
                  <Text style={styles.subtitle}>
                    We’ll use this for delivery and order updates.
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                onPress={handleClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <X size={20} color={colors.foreground} strokeWidth={2} />
              </Pressable>
            </View>

            {/* Scrollable Form */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Full Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) setErrors((e) => ({ ...e, fullName: undefined }));
                  }}
                  placeholder="e.g. James Mukasa"
                  placeholderTextColor={colors.brandStone}
                  autoCapitalize="words"
                  style={[styles.input, errors.fullName ? styles.inputError : null]}
                />
                {errors.fullName ? (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                ) : null}
              </View>

              {/* Mobile Number & Pincode Grid */}
              <View style={styles.twoColRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    Mobile Number <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={mobileNumber}
                    onChangeText={(text) => {
                      setMobileNumber(text);
                      if (errors.mobileNumber)
                        setErrors((e) => ({ ...e, mobileNumber: undefined }));
                    }}
                    placeholder="0772123456"
                    placeholderTextColor={colors.brandStone}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      errors.mobileNumber ? styles.inputError : null,
                    ]}
                  />
                  {errors.mobileNumber ? (
                    <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                  ) : null}
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    Pincode / Postal <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={pincode}
                    onChangeText={(text) => {
                      setPincode(text);
                      if (errors.pincode)
                        setErrors((e) => ({ ...e, pincode: undefined }));
                    }}
                    placeholder="256002"
                    placeholderTextColor={colors.brandStone}
                    keyboardType="number-pad"
                    style={[
                      styles.input,
                      errors.pincode ? styles.inputError : null,
                    ]}
                  />
                  {errors.pincode ? (
                    <Text style={styles.errorText}>{errors.pincode}</Text>
                  ) : null}
                </View>
              </View>

              {/* Street Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Street Address / Plot <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={addressLine}
                  onChangeText={(text) => {
                    setAddressLine(text);
                    if (errors.addressLine)
                      setErrors((e) => ({ ...e, addressLine: undefined }));
                  }}
                  placeholder="Plot 15, Kampala Road, Nakasero"
                  placeholderTextColor={colors.brandStone}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    styles.textarea,
                    errors.addressLine ? styles.inputError : null,
                  ]}
                />
                {errors.addressLine ? (
                  <Text style={styles.errorText}>{errors.addressLine}</Text>
                ) : null}
              </View>

              {/* Locality */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Locality / Landmark</Text>
                <TextInput
                  value={locality}
                  onChangeText={setLocality}
                  placeholder="e.g. Ntinda, near shopping mall"
                  placeholderTextColor={colors.brandStone}
                  style={styles.input}
                />
              </View>

              {/* City & State Grid */}
              <View style={styles.twoColRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    City <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={city}
                    onChangeText={(text) => {
                      setCity(text);
                      if (errors.city) setErrors((e) => ({ ...e, city: undefined }));
                    }}
                    placeholder="Kampala"
                    placeholderTextColor={colors.brandStone}
                    style={[styles.input, errors.city ? styles.inputError : null]}
                  />
                  {errors.city ? (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  ) : null}
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    State / Region <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={state}
                    onChangeText={(text) => {
                      setState(text);
                      if (errors.state) setErrors((e) => ({ ...e, state: undefined }));
                    }}
                    placeholder="Central Region"
                    placeholderTextColor={colors.brandStone}
                    style={[styles.input, errors.state ? styles.inputError : null]}
                  />
                  {errors.state ? (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  ) : null}
                </View>
              </View>

              {/* Country */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Uganda"
                  placeholderTextColor={colors.brandStone}
                  style={styles.input}
                />
              </View>

              {/* Address Type Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Address Type</Text>
                <View style={styles.typeRow}>
                  {ADDRESS_TYPES.map(({ label, value, icon: Icon }) => {
                    const isSelected = addressType === value;
                    return (
                      <Pressable
                        key={value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => setAddressType(value)}
                        style={[
                          styles.typeChip,
                          isSelected && styles.typeChipSelected,
                        ]}
                      >
                        <Icon
                          size={15}
                          color={isSelected ? colors.brandInk : colors.brandStone}
                          strokeWidth={isSelected ? 2.2 : 1.8}
                        />
                        <Text
                          style={[
                            styles.typeChipText,
                            isSelected && styles.typeChipTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Default Address Checkbox Card */}
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDefault }}
                onPress={() => setIsDefault(!isDefault)}
                style={styles.defaultCard}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    isDefault && styles.checkboxBoxActive,
                  ]}
                >
                  {isDefault && (
                    <Check size={14} color={colors.brandInk} strokeWidth={2.5} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.defaultTitle}>Make this my default address</Text>
                  <Text style={styles.defaultSub}>
                    Used automatically at checkout for faster orders
                  </Text>
                </View>
              </Pressable>
            </ScrollView>

            {/* Bottom Actions */}
            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, spacing.md) },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                disabled={mutation.isPending}
                onPress={handleClose}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save Address"
                disabled={mutation.isPending}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitBtn,
                  mutation.isPending && { opacity: 0.7 },
                  pressed && { opacity: 0.88 },
                ]}
              >
                {mutation.isPending ? (
                  <View style={styles.submitLoadingRow}>
                    <ActivityIndicator size="small" color={colors.brandInk} />
                    <Text style={styles.submitBtnText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>Save Address</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(22, 20, 17, 0.55)",
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  keyboardAvoid: {
    width: "100%",
    maxHeight: "90%",
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
    maxHeight: "100%",
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.amberBorder,
    backgroundColor: colors.brandCream,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.brandAmber,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 20, 17, 0.05)",
  },
  formScroll: {
    maxHeight: 460,
  },
  formContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: 5,
  },
  twoColRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.brandGray,
  },
  required: {
    color: colors.destructive,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.brandWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.foreground,
  },
  textarea: {
    minHeight: 74,
    paddingTop: 10,
  },
  inputError: {
    borderColor: colors.destructive,
    backgroundColor: "rgba(180, 35, 24, 0.02)",
  },
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.destructive,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.brandWhite,
  },
  typeChipSelected: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandAmber,
  },
  typeChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.brandGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeChipTextSelected: {
    fontFamily: typography.fontFamily.bold,
    color: colors.brandInk,
  },
  defaultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: radius.md,
    backgroundColor: "rgba(243, 239, 230, 0.5)",
    marginTop: spacing.xs,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.brandStone,
    backgroundColor: colors.brandWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandAmber,
  },
  defaultTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.foreground,
  },
  defaultSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.brandGray,
    marginTop: 1,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brandWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.brandGray,
  },
  submitBtn: {
    flex: 2,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brandAmber,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  submitLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  submitBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.brandInk,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
