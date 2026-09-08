import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ProfileLogoutButtonProps {
  onPress: () => void;
  /** Version pleine largeur, sans marge propre, pour la carte d'identité. */
  standalone?: boolean;
}

/** Sortie de session : action destructrice, donc traitée comme telle. */
export const ProfileLogoutButton: React.FC<ProfileLogoutButtonProps> = ({
  onPress,
  standalone,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("profile.logout")}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        standalone ? styles.rowStandalone : styles.rowInline,
        {
          backgroundColor: colors.dangerLight,
          borderColor: hovered || focused ? colors.danger : colors.danger + "40",
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="log-out-outline" size={22} color={colors.danger} style={styles.icon} />
      <Text style={[styles.label, { color: colors.danger }]}>{t("profile.logout")}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    cursor: "pointer",
  },
  rowInline: { marginHorizontal: SPACING.lg, marginBottom: SPACING.xs },
  rowStandalone: { width: "100%", justifyContent: "center" },
  pressed: { opacity: 0.8 },
  icon: { marginRight: SPACING.sm },
  label: { fontSize: FONT_SIZE.xl, fontFamily: F.sans500 },
});
