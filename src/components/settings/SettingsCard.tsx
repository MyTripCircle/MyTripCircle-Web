import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";
import { settingsStyles as styles } from "./settingsStyles";

interface SettingsCardProps {
  children: React.ReactNode;
  /** Supprime la marge horizontale, quand un conteneur de page la fournit déjà. */
  fluid?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Carte regroupant des lignes de réglages, séparateurs compris.
 *
 * Les séparateurs sont insérés ici plutôt que par l'appelant : une section qui
 * masque une ligne selon le contexte (offre premium, permission) ne peut pas se
 * retrouver avec un trait orphelin.
 */
export const SettingsCard: React.FC<SettingsCardProps> = ({ children, fluid, style }) => {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        fluid && styles.cardFluid,
        style,
      ]}
    >
      {rows.map((row, index) => (
        // Les lignes forment une liste ordonnée et stable, rendue par la
        // section appelante qui porte déjà ses propres clés métier.
        <React.Fragment key={index}>
          {index > 0 && (
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          )}
          {row}
        </React.Fragment>
      ))}
    </View>
  );
};
