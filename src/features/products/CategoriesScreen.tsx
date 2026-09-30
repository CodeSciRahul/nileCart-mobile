import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { queryKeys } from "@/constants/queryKeys";
import { DEPARTMENT_LABELS, DEPARTMENT_ORDER } from "@/constants";
import { getCategoryNavigation, getCategoryTree } from "@/services/categoryService";
import { ErrorState } from "@/components/ui/EmptyState";
import { getImageUrl } from "@/utils/format";
import { colors, radius, spacing, textStyles, typography } from "@/theme";
import type { Category } from "@/types/models";

function topLevelCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => {
    if (!cat.parent) return true;
    if (typeof cat.parent === "string") return false;
    return !cat.parent._id;
  });
}

export function CategoriesScreen() {
  const [department, setDepartment] = useState<string>(
    DEPARTMENT_ORDER[0] || "women"
  );

  const navQuery = useQuery({
    queryKey: queryKeys.categories.navigation,
    queryFn: getCategoryNavigation,
  });

  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: getCategoryTree,
  });

  const navDepartments = navQuery.data?.departments || [];
  const activeNav = navDepartments.find(
    (dept) => dept.department === department || dept.slug === department
  );

  const categories = useMemo(() => {
    if (activeNav?.categories?.length) {
      return activeNav.categories;
    }
    const tree = (treeQuery.data?.categories || []) as Category[];
    const roots = topLevelCategories(tree);
    const filtered = roots.filter((cat) => {
      if (!cat.department) return true;
      return cat.department === department;
    });
    return filtered.length ? filtered : roots;
  }, [activeNav, treeQuery.data, department]);

  if (treeQuery.isLoading && navQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (treeQuery.isError && !navDepartments.length) {
    return (
      <ErrorState
        description="Could not load categories."
        onRetry={() => {
          treeQuery.refetch();
          navQuery.refetch();
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Categories</Text>
      <Text style={styles.subtitle}>Start where you shop, then refine.</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.deptScroll}
        contentContainerStyle={styles.deptRow}
      >
        {DEPARTMENT_ORDER.map((key) => {
          const active = department === key;
          return (
            <Pressable
              key={key}
              onPress={() => setDepartment(key)}
              style={[styles.deptChip, active && styles.deptChipActive]}
            >
              <Text
                numberOfLines={1}
                style={[styles.deptLabel, active && styles.deptLabelActive]}
              >
                {DEPARTMENT_LABELS[key]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 ? (
          <Text style={styles.empty}>
            No categories in {DEPARTMENT_LABELS[department] || department} yet.
          </Text>
        ) : (
          <View style={styles.grid}>
            {categories.map((cat, index) => {
              const uri = getImageUrl(cat.image);
              const initial = cat.name?.charAt(0)?.toUpperCase() || "?";
              return (
                <Pressable
                  key={cat._id || cat.slug || String(index)}
                  onPress={() => router.push(`/shop/${cat.slug}`)}
                  style={styles.tile}
                >
                  <View style={styles.tileImage}>
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={styles.tileInitial}>{initial}</Text>
                    )}
                  </View>
                  <Text style={styles.tileLabel} numberOfLines={2}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...textStyles.screenTitle,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    ...textStyles.bodySecondary,
    paddingHorizontal: spacing.lg,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  deptScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  deptRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: "center",
  },
  deptChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.amberRing,
    flexShrink: 0,
  },
  deptChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deptLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.brandGray,
  },
  deptLabelActive: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.semibold,
  },
  listScroll: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  tile: {
    width: "30%",
    alignItems: "center",
    gap: spacing.sm,
  },
  tileImage: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.amberRing,
    alignItems: "center",
    justifyContent: "center",
  },
  tileInitial: {
    fontFamily: typography.fontFamily.displayMedium,
    fontSize: 22,
    color: colors.brandAmber,
  },
  tileLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    color: colors.foreground,
  },
  empty: {
    ...textStyles.bodySecondary,
    textAlign: "center",
    paddingVertical: spacing["3xl"],
  },
});
