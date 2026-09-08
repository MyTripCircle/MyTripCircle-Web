import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ConsentSaveButtonProps {
  label: string;
  onPress: () => void;
  saving?: boolean;
  disabled?: boolean;
  /** Version compacte pour l'en-tête de page desktop. */
  compact?: boolean;
}

/** Enregistrement des préférences de confidentialité. */
export const ConsentSaveButton: React.FC<ConsentSaveButtonProps> = ({
  label,
  onPress,
  saving,
  disabled,
  compact,
}) => {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const inactive = Boolean(saving || disabled);
  const background = (() => {
    if (inactive) return colors.bgDark;
    return hovered || focused ? colors.terraDark : colors.terra;
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: saving }}
      onPress={onPress}
      disabled={inactive}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : styles.block,
        {
          backgroundColor: background,
          // Bordure réservée en permanence : le focus ne décale pas la mise en page.
          borderColor: focused ? colors.text : "transparent",
        },
        pressed && styles.pressed,
      ]}
    >
      {saving ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    cursor: "pointer",
  },
  block: { borderRadius: RADIUS.card, paddingVertical: SPACING.sm + 1 },
  compact: {
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  pressed: { opacity: 0.85 },
  label: { fontFamily: F.sans700, fontSize: FONT_SIZE.xl, color: "#fff" },
  labelCompact: { fontFamily: F.sans600, fontSize: FONT_SIZE.base },
});
