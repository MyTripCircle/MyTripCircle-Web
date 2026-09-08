import React, { useState } from "react";
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface Props {
  onPress: () => void;
  disabled: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Action principale de la page Adresses au palier desktop.
 *
 * Même patron que `AddBookingButton` : un bouton libellé remplace le bouton
 * rond flottant, l'action d'ajout s'annonçant par son texte plutôt que par une
 * icône seule.
 */
const AddAddressButton: React.FC<Props> = ({ onPress, disabled, style }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [highlighted, setHighlighted] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("addresses.addAddress")}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setHighlighted(true)}
      onHoverOut={() => setHighlighted(false)}
      onFocus={() => setHighlighted(true)}
      onBlur={() => setHighlighted(false)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: highlighted ? colors.terraDark : colors.terra },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name="add" size={20} color="#FFFFFF" />
      <Text style={styles.label}>{t("addresses.addAddress")}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
    cursor: "pointer",
  },
  pressed: { opacity: 0.85 },
  label: { color: "#FFFFFF", fontFamily: F.sans600, fontSize: FONT_SIZE.base },
});

export default AddAddressButton;
