import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AUTH_ASIDE_BULLETS } from "../landing/landingContent";
import { COLORS, F, FONT_SIZE, SPACING } from "../../theme";

const ASIDE_IMAGE = require("../../../assets/background.jpg");

// Même voile que le héros de la page d'accueil : au moins 60 % de noir, ce qui
// garantit un contraste supérieur à 4.5:1 pour le texte clair quelle que soit
// la zone de la photo affichée derrière.
const SCRIM = ["rgba(18,15,10,0.62)", "rgba(18,15,10,0.90)"] as const;

/**
 * Panneau d'argumentaire des écrans d'authentification, monté uniquement à
 * partir du palier desktop par `AuthSplitLayout`.
 *
 * Il ne contient aucun élément interactif : il n'ajoute donc rien au parcours
 * clavier du formulaire voisin.
 */
export const AuthAside: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View role="complementary" style={styles.root}>
      <ImageBackground
        source={ASIDE_IMAGE}
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

      <View style={styles.content}>
        <Text role="heading" aria-level={2} style={styles.title}>
          {t("auth.aside.title")}
        </Text>
        <Text style={styles.subtitle}>{t("auth.aside.subtitle")}</Text>

        <View style={styles.bullets}>
          {AUTH_ASIDE_BULLETS.map((bullet) => (
            <View key={bullet.key} style={styles.bullet}>
              <Ionicons name={bullet.icon} size={20} color={COLORS.sandLight} />
              <Text style={styles.bulletText}>{t(bullet.textKey)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  content: {
    padding: SPACING.xxl,
    gap: SPACING.sm,
    // Mesure de ligne courte : le panneau s'élargit avec la fenêtre, pas le texte.
    maxWidth: 520,
  },
  title: {
    fontFamily: F.sans700,
    fontSize: FONT_SIZE.hero,
    lineHeight: 40,
    color: COLORS.white,
  },
  subtitle: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.lg,
    lineHeight: 24,
    color: COLORS.sandLight,
  },
  bullets: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
  },
  bulletText: {
    flex: 1,
    fontFamily: F.sans500,
    fontSize: FONT_SIZE.lg,
    lineHeight: 24,
    color: COLORS.white,
  },
});
