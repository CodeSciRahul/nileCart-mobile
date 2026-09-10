import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { queryKeys } from "@/constants/queryKeys";
import { DEPARTMENT_LABELS, DEPARTMENT_ORDER } from "@/constants";
import { getCategoryNavigation, getCategoryTree } from "@/services/categoryService";
import { ErrorState } from "@/components/ui/EmptyState";
import { colors, spacing, typography } from "@/theme";
import type { Category } from "@/types/models";

function flattenChildren(categories: Category[]): Category[] {
  const result: Category[] = [];
  const walk = (nodes: Category[]) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(categories);
  return result;
}

export function CategoriesScreen() {
  const [department, setDepartment] = useState<string>(DEPARTMENT_ORDER[0] || "women");

  const navQuery = useQuery({
    queryKey: queryKeys.categories.navigation,
    queryFn: getCategoryNavigation,
  });

  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: getCategoryTree,
  });

  const categories = useMemo(() => {
    const tree = (treeQuery.data?.categories || []) as Category[];
    const all = flattenChildren(tree);
    const filtered = all.filter((cat) => {
      if (!cat.department) return true;
      return cat.department === department;
    });
    return filtered.length ? filtered : all;
  }, [treeQuery.data, department]);

  if (navQuery.isLoading || treeQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandAmber} />
      </View>
    );
  }

  if (treeQuery.isError) {
    return (
      <ErrorState
        description="Could not load categories."
        onRetry={() => treeQuery.refetch()}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.deptRow}
      >
        {DEPARTMENT_ORDER.map((key) => (
          <Pressable
            key={key}
            onPress={() => setDepartment(key)}
            style={[
              styles.deptChip,
              department === key && styles.deptChipActive,
            ]}
          >
            <Text
              style={[
                styles.deptLabel,
                department === key && styles.deptLabelActive,
              ]}
            >
              {DEPARTMENT_LABELS[key]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {categories.map((cat) => (
          <Pressable
            key={cat._id}
            onPress={() => router.push(`/shop/${cat.slug}`)}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>{cat.name}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
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
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size["2xl"],
    color: colors.foreground,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  deptRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  deptChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 0, 0.2)",
  },
  deptChipActive: {
    backgroundColor: colors.brandAmber,
  },
  deptLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.brandGray,
  },
  deptLabelActive: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.bold,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  row: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.foreground,
  },
  chevron: {
    fontSize: 22,
    color: colors.brandGray,
  },
});
