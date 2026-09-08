import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../theme";
import type { LandingEntry } from "./landingContent";

interface StepCardProps {
  entry: LandingEntry;
  /** Rang de l'étape dans la liste, à partir de 0. */
  index: number;
}

/** Étape du parcours d'un voyage, dans la section « comment ça marche ». */
export const StepCard: React.FC<StepCardProps> = ({ entry, index }) => {
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
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: colors.terraLight }]} aria-hidden>
          <Ionicons name={entry.icon} size={20} color={colors.terraDark} />
        </View>
        {/* Le rang est écrit en toutes lettres : une fois les cartes empilées
            sur mobile, la position dans la grille ne le transmet plus. */}
        <Text style={[styles.stepLabel, { color: colors.textMid }]}>
          {t("welcome.steps.stepLabel", { number: index + 1 })}
        </Text>
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
    // Hauteur uniforme dans une même ligne de grille, comme les cartes de
    // fonctionnalités : les étapes voisines restent alignées.
    height: "100%",
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.h3,
  },
  body: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.base,
    lineHeight: 23,
  },
});
