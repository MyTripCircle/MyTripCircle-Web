import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, LAYOUT, RADIUS, SPACING } from "../../theme";
import { SidebarItem } from "./SidebarItem";
import { ACCOUNT_NAV_ITEMS, PRIMARY_NAV_ITEMS, WebNavTarget } from "./navItems";

interface SidebarProps {
  activeKey?: string;
  onNavigate: (target: WebNavTarget) => void;
}

/** Navigation latérale persistante affichée à partir du palier desktop. */
export const Sidebar: React.FC<SidebarProps> = ({ activeKey, onNavigate }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      role="navigation"
      accessibilityLabel={t("nav.primary")}
      style={[
        styles.sidebar,
        { backgroundColor: colors.surfaceSecondary, borderRightColor: colors.borderLight },
      ]}
    >
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: colors.terra }]}>
          <Ionicons name="airplane" size={18} color={colors.white} />
        </View>
        <Text style={[styles.brandName, { color: colors.text }]} numberOfLines={1}>
          {t("nav.appName")}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            isActive={item.key === activeKey}
            onPress={() => onNavigate(item.target)}
          />
        ))}
      </ScrollView>

      <View style={[styles.account, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.groupLabel, { color: colors.textMid }]}>
          {t("nav.account")}
        </Text>
        {ACCOUNT_NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            isActive={item.key === activeKey}
            onPress={() => onNavigate(item.target)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: LAYOUT.sidebarWidth,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    flex: 1,
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: SPACING.xxs,
  },
  account: {
    gap: SPACING.xxs,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  groupLabel: {
    // Même traitement que les intitulés de section de l'application :
    // capitales espacées en demi-gras (cf. SearchResultCard).
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xxs,
  },
});
