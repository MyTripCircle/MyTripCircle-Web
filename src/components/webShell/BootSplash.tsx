import React from "react";
import { ActivityIndicator, StyleSheet, useColorScheme, View } from "react-native";
import { useTranslation } from "react-i18next";

import { COLORS, RADIUS, SPACING } from "../../theme";

/**
 * Écran d'attente affiché pendant le chargement des polices.
 *
 * Rendu avant le `ThemeProvider` : les couleurs viennent directement des tokens
 * et la préférence système sert de repli. Aucune police du thème n'est utilisée,
 * elles ne sont justement pas encore disponibles.
 */
export const BootSplash: React.FC = () => {
  const { t } = useTranslation();
  const isDark = useColorScheme() === "dark";

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={t("nav.loading")}
      style={[styles.root, { backgroundColor: isDark ? COLORS.ink : COLORS.sand }]}
    >
      <View style={[styles.mark, { backgroundColor: COLORS.terra }]} />
      <ActivityIndicator size="small" color={COLORS.terra} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.lg,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
  },
});
