import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../../theme";

interface LandingSectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Centre le bloc : réservé aux sections courtes, comme l'appel à l'action final. */
  centered?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Titre de section de la page d'accueil publique.
 *
 * Toutes les sections partagent le même niveau de titre (2) et la même mesure
 * de ligne : c'est ce qui donne son rythme à la page et rend sa structure
 * annonçable telle quelle par un lecteur d'écran.
 */
export const LandingSectionHeading: React.FC<LandingSectionHeadingProps> = ({
  title,
  subtitle,
  centered = false,
  style,
}) => {
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  return (
    <View style={[styles.root, centered && styles.rootCentered, style]}>
      <Text
        role="heading"
        aria-level={2}
        style={[
          styles.title,
          isTabletUp && styles.titleLarge,
          centered && styles.centeredText,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            centered && styles.centeredText,
            { color: colors.textMid },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: SPACING.xs,
    // Mesure de ligne bornée : un paragraphe d'introduction étalé sur 1440 px
    // devient pénible à lire, même bien composé.
    maxWidth: 680,
  },
  rootCentered: {
    alignSelf: "center",
  },
  centeredText: {
    textAlign: "center",
  },
  title: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.h1,
    lineHeight: 36,
  },
  titleLarge: {
    fontSize: FONT_SIZE.hero,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.xl,
    lineHeight: 26,
  },
});
