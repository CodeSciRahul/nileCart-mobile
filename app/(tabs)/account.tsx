import { SafeAreaView } from "react-native-safe-area-context";
import { AccountScreen } from "@/features/profile/AccountScreen";
import { colors } from "@/theme";

export default function AccountTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <AccountScreen />
    </SafeAreaView>
  );
}
