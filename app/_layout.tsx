import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { ToastHost } from "@/components/ui/ToastHost";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
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
                headerStyle: { backgroundColor: colors.background },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/[slug]"
                options={{ title: "Product" }}
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
