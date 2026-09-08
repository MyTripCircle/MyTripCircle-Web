import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface LegalTocProps {
  titles: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

interface TocItemProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Entrée de sommaire. L'état courant ne repose pas sur la seule couleur
 * (WCAG 1.4.1) : repère vertical et graisse renforcée l'accompagnent.
 */
const TocItem: React.FC<TocItemProps> = ({ label, isActive, onPress }) => {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

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
        styles.item,
        { backgroundColor: background, borderColor: focused ? colors.terraDark : "transparent" },
      ]}
    >
      <View
        style={[styles.marker, { backgroundColor: isActive ? colors.terra : "transparent" }]}
      />
      <Text
        numberOfLines={2}
        style={[
          styles.label,
          { color: isActive || hovered || focused ? colors.text : colors.textMid },
          isActive && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

/** Sommaire latéral d'une page légale, affiché à partir du palier desktop. */
export const LegalToc: React.FC<LegalTocProps> = ({ titles, activeIndex, onSelect }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View role="navigation" accessibilityLabel={t("legal.toc")} style={styles.root}>
      <Text style={[styles.heading, { color: colors.textMid }]}>{t("legal.toc")}</Text>
      {titles.map((title, index) => (
        <TocItem
          key={title}
          label={title}
          isActive={index === activeIndex}
          onPress={() => onSelect(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: SPACING.xxs },
  heading: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.sm,
    paddingLeft: SPACING.xxs,
    borderRadius: RADIUS.sm,
    // Bordure toujours présente : le focus ne doit pas décaler la mise en page.
    borderWidth: 2,
    cursor: "pointer",
  },
  marker: {
    width: 3,
    borderRadius: RADIUS.pill,
    alignSelf: "stretch",
    minHeight: 18,
  },
  label: { flex: 1, fontFamily: F.sans400, fontSize: FONT_SIZE.sm, lineHeight: 19 },
  labelActive: { fontFamily: F.sans600 },
});
