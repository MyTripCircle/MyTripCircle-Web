import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { PageContainer } from "../layout";
import { RADIUS, SHADOW, SPACING } from "../../theme";
import { LandingButton } from "./LandingButton";
import { LandingSectionHeading } from "./LandingSectionHeading";

interface LandingFinalCtaProps {
  onStart: () => void;
  onSignIn: () => void;
}

/**
 * Rappel de l'appel à l'action en fin de page, pour le visiteur qui a lu
 * jusqu'en bas et n'a plus le héros sous les yeux.
 *
 * L'encart est posé sur une surface neutre bordée de terracotta plutôt que sur
 * un aplat de couleur : l'accent reste identique en thème clair et sombre, où
 * un aplat ne tiendrait pas le rapport de contraste attendu.
 */
export const LandingFinalCta: React.FC<LandingFinalCtaProps> = ({ onStart, onSignIn }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <PageContainer width="default">
        <View
          style={[
            styles.card,
            SHADOW.light,
            { backgroundColor: colors.surface, borderColor: colors.terra },
          ]}
        >
          <LandingSectionHeading
            centered
            title={t("welcome.finalCta.title")}
            subtitle={t("welcome.finalCta.body")}
          />

          <View style={[styles.ctas, !isTabletUp && styles.ctasStacked]}>
            <LandingButton
              label={t("welcome.ctaStart")}
              onPress={onStart}
              block={!isTabletUp}
            />
            <LandingButton
              label={t("welcome.ctaHaveAccount")}
              onPress={onSignIn}
              variant="secondary"
              block={!isTabletUp}
            />
          </View>
        </View>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingVertical: SPACING.xxl * 2,
  },
  card: {
    padding: SPACING.xxl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: "center",
    gap: SPACING.lg,
  },
  ctas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  ctasStacked: {
    flexDirection: "column",
    alignSelf: "stretch",
  },
});
