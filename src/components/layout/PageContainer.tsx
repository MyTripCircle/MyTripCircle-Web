import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { LAYOUT, type ContentWidth } from "../../theme";

interface PageContainerProps {
  children: React.ReactNode;
  /**
   * `wide` pour les grilles et listes, `narrow` pour les formulaires et les
   * textes longs, `default` pour les écrans de détail. Voir `LAYOUT.maxWidth`.
   */
  width?: ContentWidth;
  /** Neutralise la marge horizontale, pour un contenu à fond perdu. */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Colonne de contenu d'une page web : largeur maximale choisie par l'écran et
 * marge horizontale croissante avec la fenêtre.
 *
 * Centraliser ça évite que chaque écran invente sa propre largeur — c'est ce
 * qui distingue une mise en page pensée pour le web d'un écran mobile étiré.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  width = "default",
  flush = false,
  style,
}) => {
  const { gutter } = useBreakpoint();

  return (
    <View
      style={[
        styles.root,
        { maxWidth: LAYOUT.maxWidth[width] },
        !flush && { paddingHorizontal: gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    alignSelf: "center",
  },
});
