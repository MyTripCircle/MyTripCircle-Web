import React from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface Category {
  id: string;
  label: string;
}

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  /** Marge horizontale du contenu, fournie par l'écran. */
  inset: number;
}

/**
 * Barre d'outils de la page Idées : recherche et filtres de catégorie.
 *
 * Sur mobile la recherche occupe une ligne et les catégories défilent
 * horizontalement à fond perdu. Dès le palier tablette les deux tiennent sur
 * une même ligne et les catégories s'enroulent : masquer des filtres derrière
 * un défilement horizontal n'a plus de sens quand la place ne manque pas.
 */
const IdeasToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  inset,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  const searchField = (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isTabletUp ? styles.searchBarWide : { marginHorizontal: inset },
      ]}
    >
      <Ionicons name="search" size={18} color={colors.textLight} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={t("ideas.searchPlaceholder")}
        placeholderTextColor={colors.textLight}
        value={search}
        onChangeText={onSearchChange}
        returnKeyType="search"
        accessibilityLabel={t("ideas.searchPlaceholder")}
      />
      {search.length > 0 && (
        <TouchableOpacity
          onPress={() => onSearchChange("")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("ideas.clearSearch")}
        >
          <Ionicons name="close-circle" size={18} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );

  const chips = categories.map((cat) => {
    const active = activeCategory === cat.id;
    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.catChip,
          { backgroundColor: active ? colors.terra : colors.bgMid },
          !isTabletUp && styles.catChipSpacing,
        ]}
        onPress={() => onCategoryChange(cat.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        <Text
          style={[
            styles.catChipText,
            { color: active ? "#FFFFFF" : colors.textMid },
            active && styles.catChipTextActive,
          ]}
        >
          {cat.label}
        </Text>
      </TouchableOpacity>
    );
  });

  if (isTabletUp) {
    return (
      <View style={[styles.wideRoot, { paddingHorizontal: inset }]}>
        {searchField}
        <View style={styles.chipsWrap}>{chips}</View>
      </View>
    );
  }

  return (
    <>
      {searchField}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={[styles.categoryContent, { paddingHorizontal: inset }]}
      >
        {chips}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  wideRoot: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  searchBarWide: {
    flexGrow: 1,
    flexBasis: 280,
    maxWidth: 400,
    marginBottom: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    fontFamily: F.sans400,
    padding: 0,
    margin: 0,
  },
  categoryScroll: {
    height: 50,
    marginBottom: 14,
    flexGrow: 0,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    flexShrink: 1,
  },
  catChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    cursor: "pointer",
  },
  catChipSpacing: { marginRight: SPACING.xs },
  catChipText: { fontSize: FONT_SIZE.sm, fontFamily: F.sans500 },
  catChipTextActive: { fontFamily: F.sans600 },
});

export default IdeasToolbar;
