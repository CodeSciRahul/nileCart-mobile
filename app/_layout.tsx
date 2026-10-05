import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useDeepLinkHandler } from "@/hooks/useDeepLinkHandler";
import { ToastHost } from "@/components/ui/ToastHost";
import { colors, typography } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return children;
}

export default function RootLayout() {
  useDeepLinkHandler();

  const [fontsLoaded] = useFonts({
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-MediumItalic": require("../assets/fonts/Poppins-MediumItalic.ttf"),
    "Poppins-SemiBoldItalic": require("../assets/fonts/Poppins-SemiBoldItalic.ttf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins-BoldItalic.ttf"),
    DMSans_400Regular: require("../assets/fonts/Poppins-Regular.ttf"),
    DMSans_500Medium: require("../assets/fonts/Poppins-Medium.ttf"),
    DMSans_600SemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    DMSans_700Bold: require("../assets/fonts/Poppins-Bold.ttf"),
    Syne_600SemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    Syne_700Bold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShadowVisible: false,
                headerTintColor: colors.foreground,
                headerTitleStyle: {
                  fontFamily: typography.fontFamily.displayMedium,
                  fontSize: 17,
                  color: colors.foreground,
                },
                headerStyle: { backgroundColor: colors.background },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/[slug]"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="shop/[slug]" options={{ title: "Shop" }} />
              <Stack.Screen
                name="search"
                options={{ title: "Search", presentation: "modal" }}
              />
              <Stack.Screen
                name="auth"
                options={{ title: "Sign in", presentation: "modal" }}
              />
              <Stack.Screen name="checkout/index" options={{ title: "Checkout" }} />
              <Stack.Screen
                name="checkout/success"
                options={{ title: "Order confirmed", headerBackVisible: false }}
              />
              <Stack.Screen
                name="checkout/payment/callback"
                options={{ title: "Payment", headerBackVisible: false }}
              />
              <Stack.Screen name="account/orders" options={{ title: "Orders" }} />
              <Stack.Screen
                name="account/orders/[id]"
                options={{ title: "Order details" }}
              />
              <Stack.Screen
                name="account/addresses"
                options={{ title: "Addresses" }}
              />
              <Stack.Screen name="account/profile" options={{ title: "Profile" }} />
            </Stack>
            <ToastHost />
          </AuthBootstrap>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
