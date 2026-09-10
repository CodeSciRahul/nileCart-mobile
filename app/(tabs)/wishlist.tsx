import { SafeAreaView } from "react-native-safe-area-context";
import { WishlistScreen } from "@/features/wishlist/WishlistScreen";
import { colors } from "@/theme";

export default function WishlistTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <WishlistScreen />
    </SafeAreaView>
  );
}
