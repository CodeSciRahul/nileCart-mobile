import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreen } from "@/features/home/HomeScreen";
import { colors } from "@/theme";

export default function HomeTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <HomeScreen />
    </SafeAreaView>
  );
}
