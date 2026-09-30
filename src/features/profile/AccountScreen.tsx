import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { getMyOrders } from "@/services/checkoutService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { getImageUrl } from "@/utils/format";
import { colors, radius, spacing, textStyles, typography } from "@/theme";

type MenuItem = {
  label: string;
  hint?: string;
  href: Href;
  icon: typeof User;
};

const SHOPPING: MenuItem[] = [
  { label: "Orders", hint: "Track and manage", href: "/account/orders", icon: Package },
  { label: "Addresses", hint: "Delivery details", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", hint: "Saved pieces", href: "/(tabs)/wishlist", icon: Heart },
];

const ACCOUNT: MenuItem[] = [
  { label: "Profile", hint: "Name, mobile, birthday", href: "/account/profile", icon: User },
];

function initials(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "N";
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "N";
  const second = parts[1]?.[0];
  return `${first}${second || first}`.toUpperCase();
}

function MenuRow({
  item,
  last,
}: {
  item: MenuItem;
  last?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={() => router.push(item.href)}
      style={[styles.row, last && styles.rowLast]}
    >
      <View style={styles.rowIcon}>
        <Icon size={18} color={colors.foreground} strokeWidth={1.75} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        {item.hint ? <Text style={styles.rowHint}>{item.hint}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.brandStone} strokeWidth={1.75} />
    </Pressable>
  );
}

export function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const loading = useAuthStore((s) => s.loading);

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders({ page: 1 }),
    queryFn: () => getMyOrders({ page: 1 }),
    enabled: isAuthenticated,
  });

  const displayName = user?.name || user?.fullName || user?.email?.split("@")[0] || "there";
  const avatarUri = getImageUrl(user?.avatar);
  const orderCount = ordersQuery.data?.orders?.length ?? 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.guestContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Account</Text>
        <Text style={styles.heroTitle}>Your edit starts here</Text>
        <Text style={styles.heroBody}>
          Sign in to track orders, save addresses, and keep a wishlist of pieces you love.
        </Text>
        <Button title="Sign in" onPress={() => router.push("/auth")} />
        <Pressable onPress={() => router.push("/(tabs)")} style={styles.guestSecondary}>
          <ShoppingBag size={16} color={colors.foreground} strokeWidth={1.75} />
          <Text style={styles.guestSecondaryLabel}>Continue shopping</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>My account</Text>

      <View style={styles.identity}>
        <AvatarUpload displayName={displayName} size={58} showDetails={false} />
        <View style={styles.identityCopy}>
          <Text style={styles.hello}>Hello</Text>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {user?.email ? (
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.shortcuts}>
        <Pressable
          onPress={() => router.push("/account/orders")}
          style={styles.shortcut}
        >
          <Package size={20} color={colors.foreground} strokeWidth={1.75} />
          <Text style={styles.shortcutLabel}>Orders</Text>
          <Text style={styles.shortcutMeta}>
            {ordersQuery.isLoading ? "—" : orderCount ? `${orderCount} recent` : "None yet"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/account/addresses")}
          style={styles.shortcut}
        >
          <MapPin size={20} color={colors.foreground} strokeWidth={1.75} />
          <Text style={styles.shortcutLabel}>Address</Text>
          <Text style={styles.shortcutMeta}>Manage</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/wishlist")}
          style={styles.shortcut}
        >
          <Heart size={20} color={colors.foreground} strokeWidth={1.75} />
          <Text style={styles.shortcutLabel}>Wishlist</Text>
          <Text style={styles.shortcutMeta}>Saved</Text>
        </Pressable>
      </View>

      <Text style={styles.groupTitle}>Shopping</Text>
      <View style={styles.group}>
        {SHOPPING.map((item, index) => (
          <MenuRow key={item.label} item={item} last={index === SHOPPING.length - 1} />
        ))}
      </View>

      <Text style={styles.groupTitle}>Account</Text>
      <View style={styles.group}>
        {ACCOUNT.map((item, index) => (
          <MenuRow key={item.label} item={item} last={index === ACCOUNT.length - 1} />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={() => logout()}
        style={styles.signOut}
      >
        <LogOut size={18} color={colors.foreground} strokeWidth={1.75} />
        <Text style={styles.signOutLabel}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing["5xl"],
  },
  guestContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing["5xl"],
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  kicker: {
    ...textStyles.eyebrow,
    color: colors.brandAmber,
    letterSpacing: 2.2,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...textStyles.screenTitle,
    marginBottom: spacing.sm,
  },
  heroBody: {
    ...textStyles.bodySecondary,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  guestSecondary: {
    marginTop: spacing.sm,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestSecondaryLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.foreground,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.amberMuted,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 18,
    color: colors.primaryForeground,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  hello: {
    ...textStyles.eyebrow,
    color: colors.brandGray,
    letterSpacing: 1.4,
  },
  name: {
    marginTop: 2,
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 22,
    color: colors.foreground,
  },
  email: {
    marginTop: 2,
    ...textStyles.caption,
  },
  shortcuts: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing["2xl"],
  },
  shortcut: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.amberRing,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  shortcutLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.foreground,
    marginTop: spacing.sm,
  },
  shortcutMeta: {
    ...textStyles.caption,
    marginTop: 2,
  },
  groupTitle: {
    ...textStyles.eyebrow,
    color: colors.brandStone,
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
  },
  group: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.xl,
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brandCream,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    color: colors.foreground,
  },
  rowHint: {
    ...textStyles.caption,
    marginTop: 1,
  },
  signOut: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.foreground,
  },
});
