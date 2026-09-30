import { SafeAreaView } from "react-native-safe-area-context";
import { ProductDetailScreen } from "@/features/products/ProductDetailScreen";
import { colors } from "@/theme";

export default function ProductRoute() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ProductDetailScreen />
    </SafeAreaView>
  );
}
