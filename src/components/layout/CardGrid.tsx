import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewStyle, StyleProp } from "react-native";

import { SPACING } from "../../theme";

interface CardGridProps {
  children: React.ReactNode;
  /**
   * Largeur en dessous de laquelle une carte devient illisible. Le nombre de
   * colonnes en découle : c'est la carte qui décide, pas le palier responsive,
   * ce qui garde la grille correcte quelle que soit la largeur disponible
   * (présence de la barre latérale, gabarit deux colonnes…).
   */
  minColumnWidth?: number;
  gap?: number;
  /** Plafonne le nombre de colonnes pour les cartes qui supportent mal l'étalement. */
  maxColumns?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Grille responsive à colonnes fluides.
 *
 * React Native n'a pas de CSS Grid : on mesure la largeur réellement
 * disponible puis on calcule la largeur de colonne. Mesurer plutôt que déduire
 * du palier est indispensable ici, la grille n'occupant pas toute la fenêtre.
 */
export const CardGrid: React.FC<CardGridProps> = ({
  children,
  minColumnWidth = 280,
  gap = SPACING.md,
  maxColumns,
  style,
}) => {
  const [available, setAvailable] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setAvailable(event.nativeEvent.layout.width);
  }, []);

  const items = React.Children.toArray(children).filter(Boolean);

  // Avant la première mesure, une seule colonne : évite un flash multi-colonnes
  // à largeur nulle, et correspond au rendu mobile.
  let columns = 1;
  if (available > 0) {
    columns = Math.max(1, Math.floor((available + gap) / (minColumnWidth + gap)));
    if (maxColumns) columns = Math.min(columns, maxColumns);
    columns = Math.min(columns, Math.max(items.length, 1));
  }

  const columnWidth =
    available > 0 ? (available - gap * (columns - 1)) / columns : undefined;

  return (
    <View style={[styles.root, { gap }, style]} onLayout={handleLayout}>
      {items.map((child, index) => (
        <View
          // Les enfants sont une liste ordonnée et stable rendue par l'appelant,
          // qui porte déjà ses propres clés métier sur chaque carte.
          key={index}
          style={columnWidth === undefined ? styles.fullWidth : { width: columnWidth }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  fullWidth: { width: "100%" },
});
