import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ConsentItemProps {
  icon: string;
  title: string;
  body: string;
  badge: string;
  /** Traitement nécessaire au service : le badge passe à l'accent. */
  badgeRequired: boolean;
  enabled: boolean;
  onToggle: () => void;
}

/**
 * Consentement proposé à l'ouverture de l'application.
 *
 * La bascule reprend le dessin d'origine de l'écran plutôt que l'interrupteur
 * générique : ces trois cartes forment un bloc visuel autonome, servi avant
 * toute autre page.
 */
export const ConsentItem: React.FC<ConsentItemProps> = ({
  icon,
  title,
  body,
  badge,
  badgeRequired,
  enabled,
  onToggle,
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeRequired ? colors.terraLight : colors.bgMid },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: badgeRequired ? colors.terra : colors.textLight },
              ]}
            >
              {badge}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={title}
          accessibilityState={{ checked: enabled }}
          onPress={onToggle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={({ pressed }) => [
            styles.toggle,
            { backgroundColor: enabled ? colors.terra : colors.bgDark },
            pressed && styles.pressed,
          ]}
        >
          {/* Anneau de focus posé en dehors du flux : la bascule garde sa taille. */}
          <View
            style={[
              styles.focusRing,
              { borderColor: focused ? colors.terraDark : "transparent" },
            ]}
          />
          <View style={[styles.thumb, { transform: [{ translateX: enabled ? 20 : 2 }] }]} />
        </Pressable>
      </View>
      <Text style={[styles.body, { color: colors.textLight }]}>{body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: { borderRadius: RADIUS.card, borderWidth: 1, padding: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  icon: { fontSize: 22 },
  titleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  title: { fontFamily: F.sans600, fontSize: FONT_SIZE.base, flexShrink: 1 },
  badge: { paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: RADIUS.xl },
  badgeText: { fontFamily: F.sans600, fontSize: FONT_SIZE.xxs },
  body: { fontFamily: F.sans400, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    cursor: "pointer",
  },
  pressed: { opacity: 0.85 },
  focusRing: {
    position: "absolute",
    left: -4,
    right: -4,
    top: -4,
    bottom: -4,
    borderRadius: 17,
    borderWidth: 2,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    position: "absolute",
  },
});
