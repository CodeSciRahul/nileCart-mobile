import { Tabs } from "expo-router";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartCount } from "@/hooks/useCart";
import { colors, typography } from "@/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { count } = useCartCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.brandGray,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: colors.brandWhite,
          borderTopColor: colors.border,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Bag",
          tabBarBadge: count > 0 ? (count > 99 ? "99+" : count) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.brandAmber,
            color: colors.foreground,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
