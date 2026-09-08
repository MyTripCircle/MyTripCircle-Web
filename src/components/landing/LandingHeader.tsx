import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { PageContainer } from "../layout";
import { SPACING } from "../../theme";
import { LandingBrand } from "./LandingBrand";
import { LandingButton } from "./LandingButton";
import { LandingTextLink } from "./LandingTextLink";

interface LandingHeaderProps {
  onSignIn: () => void;
  onStart: () => void;
}

/**
 * Barre de marque de la page d'accueil publique.
 *
 * Sur mobile seul le lien de connexion est conservé : le bouton « Commencer »
 * se trouve juste en dessous, dans le héros, et le dupliquer encombrerait la
 * largeur disponible.
 */
export const LandingHeader: React.FC<LandingHeaderProps> = ({ onSignIn, onStart }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  return (
    <View
      role="banner"
      style={[styles.root, { backgroundColor: colors.bg, borderBottomColor: colors.borderLight }]}
    >
      <PageContainer width="wide" style={styles.inner}>
        <LandingBrand />

        <View style={styles.actions}>
          <LandingTextLink label={t("welcome.nav.signIn")} onPress={onSignIn} />
          {isTabletUp && (
            <LandingButton label={t("welcome.nav.start")} onPress={onStart} />
          )}
        </View>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
});
