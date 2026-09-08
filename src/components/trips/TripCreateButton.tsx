import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { OFFLINE_OPACITY } from "../../hooks/useOfflineDisabled";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  /** Variante ronde à icône seule : c'est le bouton historique du mobile. */
  compact?: boolean;
}

/**
 * Action principale de la section Voyages.
 *
 * Sur mobile elle reste un bouton rond dans le bandeau ; dès la tablette elle
 * devient un bouton libellé, qui monte dans les actions de `PageHeader` sur
 * desktop — un site web annonce son action principale par son intitulé.
 */
const TripCreateButton: React.FC<Props> = ({ onPress, disabled = false, compact = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const label = t("trips.createTrip");
  const background = hovered && !disabled ? colors.terraDark : colors.terra;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        compact ? styles.compact : styles.wide,
        { backgroundColor: background },
        focused && { borderColor: colors.text },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="add" size={compact ? 22 : 18} color="#FFFFFF" />
      {!compact && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  compact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    // La bordure est toujours présente pour que le focus ne décale rien.
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    cursor: "pointer",
  },
  wide: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
    borderWidth: 2,
    borderColor: "transparent",
    cursor: "pointer",
  },
  label: { fontSize: FONT_SIZE.base, fontFamily: F.sans600, color: "#FFFFFF" },
  disabled: { opacity: OFFLINE_OPACITY },
  pressed: { opacity: 0.85 },
});

export default TripCreateButton;
