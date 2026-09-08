import React from "react";
import { StyleSheet, View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { SPACING } from "../../theme";
import { AuthAside } from "./AuthAside";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

/** Largeur de lisibilité d'un formulaire : au-delà, les champs s'étirent pour rien. */
const FORM_COLUMN_WIDTH = 460;

/**
 * Gabarit commun aux écrans d'authentification.
 *
 * À partir du palier desktop, le formulaire est ramené à une colonne contenue
 * à gauche et un panneau d'argumentaire occupe la droite — le motif attendu
 * d'un site web, là où un formulaire étiré sur 1440 px trahirait un écran
 * mobile transposé.
 *
 * En dessous de ce palier, les enfants sont rendus tels quels : l'expérience
 * mobile existante n'est pas touchée, ni son enchaînement de vues.
 */
export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children }) => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  if (!isDesktopUp) return <>{children}</>;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.formSide}>
        <View style={styles.formColumn}>{children}</View>
      </View>
      <View style={styles.asideSide}>
        <AuthAside />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  formSide: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  formColumn: {
    flex: 1,
    width: "100%",
    maxWidth: FORM_COLUMN_WIDTH,
    // Le formulaire ne colle ni au haut ni au bas de la fenêtre, contrairement
    // au plein écran mobile où la barre système fait office de respiration.
    paddingVertical: SPACING.xl,
  },
  asideSide: {
    // Proportion plutôt que largeur fixe : le panneau suit l'agrandissement de
    // la fenêtre sans jamais réduire la colonne du formulaire sous sa mesure.
    width: "44%",
    maxWidth: 720,
  },
});
