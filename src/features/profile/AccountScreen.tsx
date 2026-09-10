import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors, spacing, typography } from "@/theme";

const LINKS = [
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Profile", href: "/account/profile" },
] as const;

export function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const loading = useAuthStore((s) => s.loading);

  if (!loading && !isAuthenticated) {
    return (
      <EmptyState
        title="Your account"
        description="Sign in to track orders, manage addresses, and more."
        actionLabel="Sign in"
        onAction={() => router.push("/auth")}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.email}>{user?.email || user?.name || "Member"}</Text>

      <View style={styles.links}>
        {LINKS.map((link) => (
          <Button
            key={link.href}
            title={link.label}
            variant="secondary"
            onPress={() => router.push(link.href)}
          />
        ))}
      </View>

      <Button
        title="Sign out"
        variant="ghost"
        onPress={async () => {
          await logout();
        }}
        style={styles.logout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
  },
  email: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.brandGray,
    fontSize: typography.size.md,
    marginBottom: spacing["2xl"],
  },
  links: { gap: spacing.md },
  logout: { marginTop: spacing["3xl"] },
});
