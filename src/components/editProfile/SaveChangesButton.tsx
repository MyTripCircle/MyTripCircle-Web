import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface SaveChangesButtonProps {
  onPress: () => void;
  /** Version compacte pour l'en-tête de page desktop. */
  compact?: boolean;
}

/**
 * Enregistrement du formulaire de profil.
 *
 * Pleine largeur en bas de formulaire sur mobile ; compact dans l'en-tête de
 * page sur desktop, où l'action principale se lit en haut à droite.
 */
export const SaveChangesButton: React.FC<SaveChangesButtonProps> = ({ onPress, compact }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("editProfile.saveChanges")}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : styles.block,
        {
          backgroundColor: hovered || focused ? colors.terraDark : colors.terra,
          // Bordure réservée en permanence : le focus ne décale pas la mise en page.
          borderColor: focused ? colors.text : "transparent",
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="checkmark-circle" size={compact ? 18 : 20} color="#FFFFFF" />
      <Text style={[styles.label, compact && styles.labelCompact]}>
        {t("editProfile.saveChanges")}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    borderWidth: 2,
    cursor: "pointer",
  },
  block: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.input,
    paddingVertical: 13,
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  compact: {
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  pressed: { opacity: 0.85 },
  label: { color: "#FFFFFF", fontSize: FONT_SIZE.lg, fontFamily: F.sans700 },
  labelCompact: { fontSize: FONT_SIZE.base, fontFamily: F.sans600 },
});
