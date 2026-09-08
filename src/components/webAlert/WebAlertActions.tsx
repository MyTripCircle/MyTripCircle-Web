import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import type { AppColors } from "../../contexts/ThemeContext";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS, F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import type { WebAlertButton, WebAlertButtonStyle } from "./alertQueue";

interface WebAlertActionsProps {
  buttons: readonly WebAlertButton[];
  onPress: (button: WebAlertButton) => void;
}

interface ButtonTone {
  background: string;
  label: string;
}

/** Reproduit le comportement natif : sans bouton fourni, un simple « OK ». */
const resolveButtons = (buttons: readonly WebAlertButton[]): readonly WebAlertButton[] =>
  buttons.length > 0 ? buttons : [{}];

/**
 * Fond et couleur de libellé par variante.
 *
 * Les deux fonds pleins viennent des jetons fixes plutôt que des variantes de
 * thème : `colors.terraDark` et `colors.danger` s'éclaircissent en thème sombre
 * et retomberaient alors sous 4.5:1 face à un libellé blanc.
 */
const resolveTone = (variant: WebAlertButtonStyle, colors: AppColors): ButtonTone => {
  if (variant === "destructive") return { background: COLORS.danger, label: COLORS.white };
  if (variant === "cancel") return { background: colors.bgMid, label: colors.text };
  return { background: COLORS.terraDark, label: COLORS.white };
};

interface AlertActionButtonProps {
  label: string;
  variant: WebAlertButtonStyle;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bouton d'alerte, décliné comme les boutons de l'application : `default` en
 * terracotta pleine, `cancel` en sable neutre, `destructive` en rouge.
 *
 * Le rouge n'est jamais le seul porteur de l'information (WCAG 1.4.1) : la
 * variante destructrice affiche aussi un pictogramme d'avertissement.
 */
export const AlertActionButton: React.FC<AlertActionButtonProps> = ({
  label,
  variant,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const tone = resolveTone(variant, colors);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      // Le retour d'appui passe par l'anneau et non par l'opacité du mobile :
      // atténuer le bouton ferait chuter le contraste du libellé sous 4.5:1.
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tone.background,
          // Le libellé contraste déjà avec son fond : il fait un anneau sûr.
          borderColor: focused || pressed ? tone.label : "transparent",
        },
        style,
      ]}
    >
      {variant === "destructive" ? (
        <Ionicons name="warning-outline" size={18} color={tone.label} aria-hidden />
      ) : null}
      <Text numberOfLines={1} style={[styles.label, { color: tone.label }]}>
        {label}
      </Text>
    </Pressable>
  );
};

/** Rangée de boutons d'une alerte web. */
export const WebAlertActions: React.FC<WebAlertActionsProps> = ({ buttons, onPress }) => {
  const { t } = useTranslation();

  const resolved = resolveButtons(buttons);
  // Au-delà de deux boutons on empile, comme le dialogue natif. Le partage
  // horizontal (`flex: 1`) n'a alors plus lieu d'être : il écraserait la hauteur
  // des boutons dans une colonne dimensionnée par son contenu.
  const stacked = resolved.length > 2;
  const buttonStyle = stacked ? undefined : styles.rowButton;

  return (
    <View style={stacked ? styles.column : styles.row}>
      {resolved.map((button, index) => {
        const label = button.text ?? t("common.ok");
        return (
          <AlertActionButton
            key={`${index}-${label}`}
            label={label}
            variant={button.style ?? "default"}
            style={buttonStyle}
            onPress={() => onPress(button)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: SPACING.xs, marginTop: SPACING.md },
  column: { flexDirection: "column", gap: SPACING.xs, marginTop: SPACING.md },
  rowButton: { flex: 1 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    borderRadius: RADIUS.button,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    // Cible tactile confortable, bordure toujours présente pour que l'anneau de
    // focus n'entraîne aucun décalage de mise en page.
    minHeight: 48,
    borderWidth: 2,
    cursor: "pointer",
  },
  label: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.lg,
    textAlign: "center",
  },
});
