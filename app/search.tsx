import { SafeAreaView } from "react-native-safe-area-context";
import { SearchScreen } from "@/features/search/SearchScreen";
import { colors } from "@/theme";

export default function SearchRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <SearchScreen />
    </SafeAreaView>
  );
}
