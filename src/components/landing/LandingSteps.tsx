import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { CardGrid, PageContainer } from "../layout";
import { SPACING } from "../../theme";
import { LandingSectionHeading } from "./LandingSectionHeading";
import { StepCard } from "./StepCard";
import { LANDING_STEPS } from "./landingContent";

/**
 * Section « comment ça marche » : le parcours réel d'un voyage, de sa création
 * à l'export vers l'agenda.
 *
 * Le fond légèrement plus clair et le filet supérieur détachent la section de
 * la grille de fonctionnalités qui la précède, sans recourir à un aplat de
 * couleur qui compromettrait le contraste du texte secondaire.
 */
export const LandingSteps: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      role="region"
      accessibilityLabel={t("welcome.steps.title")}
      style={[
        styles.root,
        { backgroundColor: colors.bgLight, borderTopColor: colors.borderLight },
      ]}
    >
      <PageContainer width="wide">
        <LandingSectionHeading title={t("welcome.steps.title")} style={styles.heading} />

        <CardGrid minColumnWidth={280} maxColumns={3} gap={SPACING.lg}>
          {LANDING_STEPS.map((entry, index) => (
            <StepCard key={entry.key} entry={entry} index={index} />
          ))}
        </CardGrid>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingVertical: SPACING.xxl * 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  heading: {
    marginBottom: SPACING.xxl,
  },
});
