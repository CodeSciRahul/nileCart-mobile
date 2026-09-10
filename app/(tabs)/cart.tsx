import { SafeAreaView } from "react-native-safe-area-context";
import { CartScreen } from "@/features/cart/CartScreen";
import { colors } from "@/theme";

export default function CartTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <CartScreen />
    </SafeAreaView>
  );
}
