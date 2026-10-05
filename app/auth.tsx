import { ScrollView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AuthForm } from "@/features/auth/AuthForm";
import { colors, spacing } from "@/theme";

export default function AuthRoute() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AuthForm
        onSuccess={() => {
          if (redirect) {
            try {
              const target = decodeURIComponent(redirect);
              router.replace(target as any);
              return;
            } catch {
              router.replace(redirect as any);
              return;
            }
          }
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing["5xl"] },
});
