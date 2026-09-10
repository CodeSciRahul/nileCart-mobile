import { Image } from "expo-image";
import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

type Props = {
  compact?: boolean;
  onPress?: () => void;
};

export function BrandLogo({ compact = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Nilescart home"
      onPress={onPress ?? (() => router.push("/(tabs)"))}
      hitSlop={8}
    >
      <Image
        source={
          compact
            ? require("../../assets/brand/nilescart_icon_light.png")
            : require("../../assets/brand/nilescart_full_light.png")
        }
        style={compact ? styles.icon : styles.full}
        contentFit="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: {
    width: 140,
    height: 36,
  },
  icon: {
    width: 40,
    height: 32,
  },
});
