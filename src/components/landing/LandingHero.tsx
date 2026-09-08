import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { PageContainer } from "../layout";
import { COLORS, F, FONT_SIZE, SPACING } from "../../theme";
import { LandingButton } from "./LandingButton";

const HERO_IMAGE = require("../../../assets/background.jpg");

// Un voile d'au moins 60 % de noir garantit un contraste supérieur à 4.5:1 pour
// le texte blanc, quelle que soit la zone de la photo affichée derrière.
const SCRIM = ["rgba(18,15,10,0.62)", "rgba(18,15,10,0.90)"] as const;

interface LandingHeroProps {
  onStart: () => void;
  onSignIn: () => void;
}

/** Bandeau d'ouverture : proposition de valeur et appels à l'action. */
export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onSignIn }) => {
  const { t } = useTranslation();
  const { isTabletUp, isDesktopUp, height } = useBreakpoint();

  // Sur mobile le héros occupe l'essentiel de la fenêtre, comme avant le
  // passage au web, tout en laissant deviner la suite de la page.
  const minHeight = (() => {
    if (isDesktopUp) return 640;
    if (isTabletUp) return 540;
    return Math.max(460, Math.round(height * 0.72));
  })();

  return (
    <View style={[styles.root, { minHeight }]}>
      <ImageBackground
        source={HERO_IMAGE}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        // Photo d'ambiance : elle ne porte aucune information à restituer.
        aria-hidden
      />
      <LinearGradient
        colors={[...SCRIM]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <PageContainer width="wide" style={styles.container}>
        <View style={[styles.column, isDesktopUp && styles.columnDesktop]}>
          <Text style={styles.eyebrow}>{t("welcome.hero.eyebrow")}</Text>
          <Text
            role="heading"
            aria-level={1}
            style={[styles.title, isTabletUp && styles.titleLarge]}
          >
            {t("welcome.hero.title")}
          </Text>
          <Text style={styles.subtitle}>{t("welcome.hero.subtitle")}</Text>

          <View style={[styles.ctas, !isTabletUp && styles.ctasStacked]}>
            <LandingButton
              label={t("welcome.ctaStart")}
              onPress={onStart}
              block={!isTabletUp}
            />
            <LandingButton
              label={t("welcome.ctaHaveAccount")}
              onPress={onSignIn}
              variant="overlay"
              block={!isTabletUp}
            />
          </View>

          <Text style={styles.hint}>{t("welcome.hero.freeHint")}</Text>
        </View>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  container: {
    paddingVertical: SPACING.xxl,
  },
  column: {
    gap: SPACING.md,
  },
  columnDesktop: {
    // Mesure de ligne courte : un titre de héros pleine largeur devient illisible.
    maxWidth: 660,
  },
  eyebrow: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.sandLight,
  },
  title: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.hero,
    lineHeight: 40,
    color: COLORS.white,
  },
  titleLarge: {
    fontSize: 46,
    lineHeight: 54,
  },
  subtitle: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.xl,
    lineHeight: 26,
    color: COLORS.sandLight,
    maxWidth: 560,
  },
  ctas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  ctasStacked: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  hint: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.md,
    color: COLORS.sandLight,
  },
});
