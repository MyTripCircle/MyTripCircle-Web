import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/**
 * « Tout marquer comme lu ».
 *
 * Simple lien textuel dans le bandeau mobile, bouton bordé dans l'en-tête de
 * page desktop, où il est l'action principale de l'écran.
 */
export const MarkAllReadButton: React.FC<{ onPress: () => void; framed?: boolean }> = ({
  onPress,
  framed,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const highlighted = hovered || focused;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("notifications.markAllRead")}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        framed && styles.framed,
        framed && {
          backgroundColor: highlighted ? colors.terraLight : "transparent",
          borderColor: focused ? colors.terraDark : colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {framed ? (
        <Ionicons name="checkmark-done-outline" size={16} color={colors.terra} />
      ) : null}
      <Text
        style={[
          styles.label,
          { color: colors.terra },
          !framed && highlighted && styles.underlined,
        ]}
      >
        {t("notifications.markAllRead")}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xxs,
    cursor: "pointer",
  },
  framed: {
    borderWidth: 1,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  pressed: { opacity: 0.7 },
  label: { fontSize: FONT_SIZE.base, fontFamily: F.sans600 },
  // Le survol d'un lien textuel ne se signale pas que par la couleur.
  underlined: { textDecorationLine: "underline" },
});
