import React, { useCallback } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../../theme";

interface LegalSectionProps {
  title: string;
  body: string;
  /**
   * Position verticale de la section dans sa colonne, remontée pour permettre
   * au sommaire de s'y rendre. Absent sur mobile, où il n'y a pas de sommaire.
   */
  onMeasure?: (y: number) => void;
}

/**
 * Section d'un texte légal.
 *
 * Sur grand écran la hiérarchie typographique s'accentue (titre plus grand,
 * interlignage et respiration plus généreux) : un texte long lu à la souris n'a
 * pas les mêmes repères qu'un texte parcouru au pouce.
 */
export const LegalSection: React.FC<LegalSectionProps> = ({ title, body, onMeasure }) => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => onMeasure?.(event.nativeEvent.layout.y),
    [onMeasure],
  );

  return (
    <View
      style={[styles.section, isDesktopUp && styles.sectionDesktop]}
      onLayout={onMeasure ? handleLayout : undefined}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, isDesktopUp && styles.titleDesktop, { color: colors.terra }]}
      >
        {title}
      </Text>
      <Text style={[styles.body, isDesktopUp && styles.bodyDesktop, { color: colors.textMid }]}>
        {body}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  sectionDesktop: { marginBottom: SPACING.xxl + SPACING.xxs },
  title: { fontFamily: F.sans600, fontSize: 19, marginBottom: SPACING.xs + 2 },
  titleDesktop: { fontFamily: F.sans700, fontSize: FONT_SIZE.h2, marginBottom: SPACING.sm },
  body: { fontFamily: F.sans400, fontSize: FONT_SIZE.xl, lineHeight: 28 },
  bodyDesktop: { lineHeight: 31 },
});
