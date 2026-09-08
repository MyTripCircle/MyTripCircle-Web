import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { SPACING } from "../../theme";

interface TwoColumnProps {
  main: React.ReactNode;
  aside: React.ReactNode;
  /** Largeur de la colonne latérale sur desktop. */
  asideWidth?: number;
  /** Place la colonne latérale avant le contenu principal sur desktop. */
  asideFirst?: boolean;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Gabarit d'écran de détail : contenu principal fluide et colonne latérale de
 * largeur fixe (métadonnées, actions, encarts).
 *
 * En dessous du palier desktop les deux colonnes s'empilent, le contenu
 * principal d'abord — l'ordre de lecture mobile reste celui attendu, quelle que
 * soit la position de la colonne latérale sur grand écran.
 */
export const TwoColumn: React.FC<TwoColumnProps> = ({
  main,
  aside,
  asideWidth = 320,
  asideFirst = false,
  gap = SPACING.xxl,
  style,
}) => {
  const { isDesktopUp } = useBreakpoint();

  if (!isDesktopUp) {
    return (
      <View style={[styles.stack, { gap }, style]}>
        <View>{main}</View>
        <View>{aside}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.row,
        { gap, flexDirection: asideFirst ? "row-reverse" : "row" },
        style,
      ]}
    >
      <View style={styles.main}>{main}</View>
      <View style={{ width: asideWidth }}>{aside}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  stack: { width: "100%" },
  row: { width: "100%", alignItems: "flex-start" },
  main: { flex: 1, minWidth: 0 },
});
