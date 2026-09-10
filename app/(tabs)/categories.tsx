import { SafeAreaView } from "react-native-safe-area-context";
import { CategoriesScreen } from "@/features/products/CategoriesScreen";
import { colors } from "@/theme";

export default function CategoriesTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <CategoriesScreen />
    </SafeAreaView>
  );
}
