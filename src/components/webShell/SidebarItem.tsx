import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import type { WebNavItem } from "./navItems";

interface SidebarItemProps {
  item: WebNavItem;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Entrée de navigation latérale.
 *
 * L'état actif ne repose pas sur la seule couleur (WCAG 1.4.1) : il combine un
 * repère vertical, l'icône pleine, une graisse plus marquée et `selected`.
 */
export const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const highlighted = isActive || hovered || focused;
  const label = t(item.labelKey);

  const background = (() => {
    if (isActive) return colors.terraLight;
    if (hovered || focused) return colors.borderLight;
    return "transparent";
  })();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.row,
        {
          backgroundColor: background,
          borderColor: focused ? colors.terraDark : "transparent",
        },
      ]}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: isActive ? colors.terra : "transparent" },
        ]}
      />
      <Ionicons
        name={isActive ? item.iconActive : item.icon}
        size={20}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.md,
    paddingLeft: SPACING.xs,
    borderRadius: RADIUS.md,
    // La bordure est toujours présente pour que le focus ne décale pas la mise en page.
    borderWidth: 2,
    cursor: "pointer",
  },
  marker: {
    width: 3,
    height: 20,
    borderRadius: RADIUS.pill,
  },
  label: {
    flex: 1,
    fontFamily: F.sans500,
    fontSize: FONT_SIZE.base,
  },
  labelActive: {
    fontFamily: F.sans600,
  },
});
