import { ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { AuthForm } from "@/features/auth/AuthForm";
import { colors, spacing } from "@/theme";

export default function AuthRoute() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AuthForm
        onSuccess={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing["5xl"] },
});
