import { useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles, X } from "lucide-react-native";
import { colors, radius, typography } from "@/theme";

type Props = {
  images: string[];
  discountPercent?: number;
  isTrending?: boolean;
};

export function ProductGallery({
  images,
  discountPercent = 0,
  isTrending = false,
}: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const galleryList = images.length > 0 ? images : [null];
  const galleryHeight = Math.min(width * (4 / 3), 560);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / width);
    if (nextIndex !== activeIndex && nextIndex >= 0 && nextIndex < galleryList.length) {
      setActiveIndex(nextIndex);
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  return (
    <View style={[styles.container, { width, height: galleryHeight }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {galleryList.map((uri, index) => (
          <Pressable
            key={uri ? `${uri}-${index}` : `placeholder-${index}`}
            onPress={() => uri && openFullscreen(index)}
            style={{ width, height: galleryHeight }}
          >
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.image}
                contentFit="cover"
                transition={200}
                priority={index === 0 ? "high" : "normal"}
              />
            ) : (
              <View style={[styles.image, styles.placeholder]}>
                <Text style={styles.placeholderText}>Nilescart</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Floating Badges (Bottom Left) */}
      <View style={styles.badgeStack}>
        {discountPercent > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
          </View>
        ) : null}

        {isTrending ? (
          <View style={styles.trendBadge}>
            <Sparkles size={11} color={colors.foreground} />
            <Text style={styles.trendBadgeText}>TRENDING</Text>
          </View>
        ) : null}
      </View>

      {/* Savana-style Image Counter Pill (Bottom Right) */}
      {galleryList.length > 1 ? (
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>
            {activeIndex + 1}/{galleryList.length}
          </Text>
        </View>
      ) : null}

      {/* Fullscreen Image Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={styles.fullscreenBackdrop}>
          <View
            style={[
              styles.fullscreenHeader,
              { paddingTop: Math.max(insets.top, 16) + 8 },
            ]}
          >
            <View style={styles.fullscreenCounter}>
              <Text style={styles.fullscreenCounterText}>
                {fullscreenIndex + 1} / {images.length}
              </Text>
            </View>
            <Pressable
              hitSlop={12}
              onPress={() => setFullscreenVisible(false)}
              style={styles.fullscreenCloseBtn}
            >
              <X size={22} color={colors.brandWhite} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: fullscreenIndex * width, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const nextIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setFullscreenIndex(nextIndex);
            }}
          >
            {images.map((uri, idx) => (
              <View
                key={`fs-${uri}-${idx}`}
                style={{ width, height: height - 100, justifyContent: "center" }}
              >
                <Image
                  source={{ uri }}
                  style={styles.fullscreenImage}
                  contentFit="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.imagePlaceholder,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: colors.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: typography.size.xl,
    color: colors.brandGray,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  badgeStack: {
    position: "absolute",
    left: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discountBadge: {
    backgroundColor: colors.foreground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  discountBadgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandWhite,
    letterSpacing: 0.5,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  trendBadgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    color: colors.foreground,
    letterSpacing: 0.8,
  },
  counterPill: {
    position: "absolute",
    bottom: 14,
    right: 14,
    backgroundColor: colors.overlayScrim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  counterText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.brandWhite,
    letterSpacing: 0.8,
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: colors.lightbox,
  },
  fullscreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  fullscreenCounter: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.whiteMuted,
    borderRadius: radius.full,
  },
  fullscreenCounterText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.brandWhite,
  },
  fullscreenCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.whiteMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
});
