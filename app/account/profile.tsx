import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { updateUserProfile } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { colors, radius, spacing, textStyles, typography } from "@/theme";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;

export default function ProfileRoute() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setSession);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const showToast = useUiStore((s) => s.showToast);

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    setName(user?.name || user?.fullName || "");
    setMobileNumber(user?.mobileNumber || "");
    setGender(user?.gender || "");
    setBirthday(
      user?.birthday ? new Date(user.birthday).toISOString().slice(0, 10) : ""
    );
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateUserProfile({
        name: name.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
        gender: gender || undefined,
        birthday: birthday || undefined,
      }),
    onSuccess: async (data) => {
      if (data.user) {
        await setUser({ user: data.user });
      } else {
        await refreshProfile();
      }
      showToast("Profile updated", "success");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof Error ? error.message : "Could not update profile.",
        "error"
      );
    },
  });

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view profile"
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Profile</Text>
      <Text style={styles.heading}>Your details</Text>

      <View style={styles.avatarCard}>
        <AvatarUpload displayName={name} size={76} showDetails={true} />
      </View>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email || "—"}</Text>

      <Input
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />
      <Input
        label="Mobile number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="number-pad"
        placeholder="10-digit mobile number"
      />
      <Input
        label="Birthday"
        value={birthday}
        onChangeText={setBirthday}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((option) => (
          <Pressable
            key={option}
            onPress={() => setGender(option)}
            style={[
              styles.genderChip,
              gender === option && styles.genderChipActive,
            ]}
          >
            <Text
              style={[
                styles.genderLabel,
                gender === option && styles.genderLabelActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button
        title="Save changes"
        loading={updateMutation.isPending}
        disabled={updateMutation.isPending}
        onPress={() => updateMutation.mutate()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing["5xl"],
  },
  kicker: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2,
  },
  heading: {
    ...textStyles.sectionTitle,
    marginBottom: spacing.sm,
  },
  avatarCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandGray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.md,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  genderRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  genderChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brandWhite,
  },
  genderChipActive: {
    borderColor: colors.brandAmber,
    backgroundColor: colors.brandCream,
  },
  genderLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },
  genderLabelActive: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.semibold,
  },
});
