import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { parseNilesCartUrl } from "@/utils/deepLink";
import { useAuthStore } from "@/store/authStore";

const DEDUPE_WINDOW_MS = 1500;

// Routes that require user authentication
const PROTECTED_PREFIXES = ["/account", "/checkout"];

export function useDeepLinkHandler() {
  const lastProcessedUrlRef = useRef<string | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleDeepLink = (rawUrl: string | null) => {
      if (!rawUrl) return;

      const now = Date.now();
      // Deduplicate rapid duplicate events (e.g. initial URL + listener firing)
      if (
        lastProcessedUrlRef.current === rawUrl &&
        now - lastProcessedTimeRef.current < DEDUPE_WINDOW_MS
      ) {
        return;
      }

      lastProcessedUrlRef.current = rawUrl;
      lastProcessedTimeRef.current = now;

      const parsed = parseNilesCartUrl(rawUrl);
      if (!parsed) return;

      if (__DEV__) {
        console.log("[DeepLink] Received URL:", rawUrl, "Parsed:", parsed);
      }

      // Check if route requires authentication
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        parsed.pathname.startsWith(prefix)
      );

      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      if (isProtected && !isAuthenticated) {
        // Preserve destination for post-login redirection
        const redirectParam = encodeURIComponent(parsed.pathname);
        router.push(`/auth?redirect=${redirectParam}` as any);
        return;
      }

      // Route to product detail if it's a product link
      if (parsed.isProduct && parsed.slug) {
        router.push({
          pathname: "/product/[slug]",
          params: { slug: parsed.slug },
        } as any);
        return;
      }

      // General fallback navigation for valid routes
      if (parsed.pathname && parsed.pathname !== "/") {
        try {
          router.push(parsed.pathname as any);
        } catch (err) {
          if (__DEV__) {
            console.warn("[DeepLink] Could not navigate to path:", parsed.pathname, err);
          }
        }
      }
    };

    // 1. Handle runtime incoming URL events (background -> foreground & foreground)
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    // 2. Cold-start URL check (Expo Router usually handles this, but this guarantees fallback)
    Linking.getInitialURL()
      .then((initialUrl) => {
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      })
      .catch(() => undefined);

    // 3. Clean up listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);
}
