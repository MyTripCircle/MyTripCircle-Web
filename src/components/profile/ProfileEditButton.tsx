import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ProfileEditButtonProps {
  onPress: () => void;
}

/**
 * Action principale de l'en-tête de page sur desktop. Sur mobile, l'édition
 * reste accessible depuis la carte d'identité : ce bouton n'est monté que par
 * `PageHeader`, qui ne rend ses actions qu'au palier desktop.
 */
export const ProfileEditButton: React.FC<ProfileEditButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("profile.editProfile")}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: hovered || focused ? colors.terraDark : colors.terra,
          // Bordure réservée en permanence : l'anneau de focus ne doit pas
          // décaler la mise en page de l'en-tête à l'apparition.
          borderColor: focused ? colors.text : "transparent",
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="create-outline" size={18} color="#FFFFFF" />
      <Text style={styles.label}>{t("profile.editProfile")}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    borderWidth: 2,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    cursor: "pointer",
  },
  pressed: { opacity: 0.85 },
  label: { fontSize: FONT_SIZE.base, fontFamily: F.sans600, color: "#FFFFFF" },
});
