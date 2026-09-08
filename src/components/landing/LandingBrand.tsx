import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/**
 * Signature de marque de la page d'accueil.
 *
 * Partagée par l'en-tête et le pied de page : les deux occurrences ne peuvent
 * donc pas diverger au fil des retouches.
 */
export const LandingBrand: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      {/* Pictogramme purement décoratif : le nom de la marque le suit
          immédiatement, l'annoncer une seconde fois n'apporte rien. */}
      <View style={[styles.mark, { backgroundColor: colors.terra }]} aria-hidden>
        <Ionicons name="airplane" size={18} color={colors.white} />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {t("appName")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexShrink: 1,
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.xxl,
    flexShrink: 1,
  },
});
