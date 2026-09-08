import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: number;
  /** Met la ligne à l'accent terracotta (abonnement, options premium). */
  tinted?: boolean;
  onPress: () => void;
}

/**
 * Ligne de navigation d'une section de profil.
 *
 * Comme sur un site, elle se comporte en lien : curseur, survol et repère de
 * focus au clavier. La densité se resserre au palier desktop, où la souris n'a
 * pas besoin d'une cible de 56 px de haut.
 */
export const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  label,
  value,
  badge,
  tinted,
  onPress,
}) => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        isDesktopUp && styles.rowDense,
        (hovered || focused) && { backgroundColor: colors.bg },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[styles.focusMarker, { backgroundColor: focused ? colors.terra : "transparent" }]}
      />
      <Ionicons
        name={icon}
        size={22}
        color={tinted ? colors.terra : colors.textMid}
        style={styles.icon}
      />
      <Text style={[styles.label, { color: tinted ? colors.terra : colors.text }]}>
        {label}
      </Text>
      <View style={styles.right}>
        {value ? <Text style={[styles.value, { color: colors.textLight }]}>{value}</Text> : null}
        {badge === undefined ? null : (
          <View style={[styles.badge, { backgroundColor: colors.terraLight }]}>
            <Text style={[styles.badgeText, { color: colors.terra }]}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.bgDark} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    cursor: "pointer",
  },
  rowDense: { paddingVertical: 14 },
  // Repère de focus en absolu : visible sans jamais décaler la ligne.
  focusMarker: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  pressed: { opacity: 0.7 },
  icon: { marginRight: SPACING.md, width: 24, textAlign: "center" },
  label: { flex: 1, fontSize: FONT_SIZE.xl, fontFamily: F.sans500 },
  right: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  value: { fontSize: FONT_SIZE.md, fontFamily: F.sans400 },
  badge: {
    borderRadius: RADIUS.pill,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: FONT_SIZE.xxs, fontFamily: F.sans700 },
});
