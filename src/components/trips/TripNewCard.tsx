import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  /** Laisse la grille imposer la largeur, au lieu des 190 px du carrousel mobile. */
  fluid?: boolean;
}

const TripNewCard: React.FC<Props> = ({ onPress, disabled, fluid = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const highlighted = (hovered || focused) && !disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("trips.createTrip")}
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.dashedCard,
        fluid ? styles.dashedCardFluid : styles.dashedCardFixed,
        { borderColor: highlighted ? colors.terra : colors.bgDark, backgroundColor: colors.bg },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.dashedAddCircle, { backgroundColor: colors.terraLight }]}>
        <Text style={[styles.dashedAddPlus, { color: colors.terra }]}>+</Text>
      </View>
      <Text style={[styles.dashedNewLabel, { color: highlighted ? colors.terra : colors.textLight }]}>
        {t("trips.newButton")}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  dashedCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  dashedCardFixed: { width: 190, height: 176 },
  dashedCardFluid: { width: "100%", height: 240 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  dashedAddCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  dashedAddPlus: { fontSize: 36, lineHeight: 38, fontFamily: F.sans400 },
  dashedNewLabel: { fontSize: 14, fontFamily: F.sans500 },
});

export default TripNewCard;
