import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { CardGrid, PageContainer } from "../layout";
import { SPACING } from "../../theme";
import { FeatureCard } from "./FeatureCard";
import { LandingSectionHeading } from "./LandingSectionHeading";
import { LANDING_FEATURES } from "./landingContent";

/** Section « fonctionnalités » : une carte par capacité réelle du produit. */
export const LandingFeatures: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      role="region"
      accessibilityLabel={t("welcome.features.title")}
      style={[styles.root, { backgroundColor: colors.bg }]}
    >
      <PageContainer width="wide">
        <LandingSectionHeading
          title={t("welcome.features.title")}
          subtitle={t("welcome.features.subtitle")}
          style={styles.heading}
        />

        {/* Trois colonnes au maximum : au-delà, les cartes s'étirent et le
            texte perd sa mesure de lecture. */}
        <CardGrid minColumnWidth={300} maxColumns={3} gap={SPACING.lg}>
          {LANDING_FEATURES.map((entry) => (
            <FeatureCard key={entry.key} entry={entry} />
          ))}
        </CardGrid>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingVertical: SPACING.xxl * 2,
  },
  heading: {
    marginBottom: SPACING.xxl,
  },
});
