import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import { SETTINGS_SECTIONS, SettingsSectionDef, SettingsSectionKey } from "./sections";

interface SettingsSectionNavProps {
  active: SettingsSectionKey;
  onSelect: (key: SettingsSectionKey) => void;
}

interface NavItemProps {
  section: SettingsSectionDef;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Entrée de navigation de section.
 *
 * Chaque entrée reste atteignable au clavier par tabulation et s'active à
 * l'entrée ou à l'espace. L'état courant ne repose pas sur la seule couleur
 * (WCAG 1.4.1) : repère vertical, icône pleine et graisse renforcée.
 */
const NavItem: React.FC<NavItemProps> = ({ section, isActive, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const label = t(section.navLabelKey);
  const highlighted = isActive || hovered || focused;

  const background = (() => {
    if (isActive) return colors.terraLight;
    if (hovered || focused) return colors.borderLight;
    return "transparent";
  })();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.item,
        {
          backgroundColor: background,
          borderColor: focused ? colors.terraDark : "transparent",
        },
      ]}
    >
      <View
        style={[styles.marker, { backgroundColor: isActive ? colors.terra : "transparent" }]}
      />
      <Ionicons
        name={isActive ? section.iconActive : section.icon}
        size={18}
        color={isActive ? colors.terraDark : colors.textMid}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: highlighted ? colors.text : colors.textMid },
          isActive && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

/** Navigation de sections d'un écran de réglages, à partir du palier desktop. */
export const SettingsSectionNav: React.FC<SettingsSectionNavProps> = ({ active, onSelect }) => (
  <View role="tablist" style={styles.root}>
    {SETTINGS_SECTIONS.map((section) => (
      <NavItem
        key={section.key}
        section={section}
        isActive={section.key === active}
        onPress={() => onSelect(section.key)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { gap: SPACING.xxs },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
    paddingLeft: SPACING.xs,
    borderRadius: RADIUS.md,
    // Bordure toujours présente : le focus ne doit pas décaler la mise en page.
    borderWidth: 2,
    cursor: "pointer",
  },
  marker: { width: 3, height: 20, borderRadius: RADIUS.pill },
  label: { flex: 1, fontFamily: F.sans500, fontSize: FONT_SIZE.base },
  labelActive: { fontFamily: F.sans600 },
});
