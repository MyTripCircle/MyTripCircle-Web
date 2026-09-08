import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../theme";
import type { LandingEntry } from "./landingContent";

interface FeatureCardProps {
  entry: LandingEntry;
}

/** Carte de présentation d'une fonctionnalité, dans la grille de la page d'accueil. */
export const FeatureCard: React.FC<FeatureCardProps> = ({ entry }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        SHADOW.light,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: colors.terraLight }]}>
        <Ionicons name={entry.icon} size={22} color={colors.terraDark} />
      </View>
      <Text role="heading" aria-level={3} style={[styles.title, { color: colors.text }]}>
        {t(entry.titleKey)}
      </Text>
      <Text style={[styles.body, { color: colors.textMid }]}>{t(entry.bodyKey)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    // Hauteur uniforme dans une même ligne de grille, quelle que soit la
    // longueur du texte : les cartes voisines restent alignées.
    height: "100%",
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.xs,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xxs,
  },
  title: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.xxl,
  },
  body: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.base,
    lineHeight: 23,
  },
});
