import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { PageContainer } from "../layout";
import { F, FONT_SIZE, SPACING } from "../../theme";
import { LandingBrand } from "./LandingBrand";
import { LandingTextLink } from "./LandingTextLink";

interface LandingFooterProps {
  onNavigateTerms: () => void;
  onNavigatePrivacy: () => void;
  onNavigateLegalNotice: () => void;
}

/** Pied de page public : marque et accès aux pages légales de l'application. */
export const LandingFooter: React.FC<LandingFooterProps> = ({
  onNavigateTerms,
  onNavigatePrivacy,
  onNavigateLegalNotice,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  const links = [
    { key: "terms", label: t("welcome.footer.terms"), onPress: onNavigateTerms },
    { key: "privacy", label: t("welcome.footer.privacy"), onPress: onNavigatePrivacy },
    { key: "legal", label: t("welcome.footer.legal"), onPress: onNavigateLegalNotice },
  ];

  return (
    <View
      role="contentinfo"
      style={[
        styles.root,
        { backgroundColor: colors.bgLight, borderTopColor: colors.border },
      ]}
    >
      <PageContainer width="wide">
        <View style={[styles.columns, isTabletUp && styles.columnsRow]}>
          <View style={styles.brandBlock}>
            <LandingBrand />
            <Text style={[styles.tagline, { color: colors.textMid }]}>
              {t("welcome.footer.tagline")}
            </Text>
          </View>

          <View style={styles.legalBlock}>
            <Text
              role="heading"
              aria-level={2}
              style={[styles.legalHeading, { color: colors.text }]}
            >
              {t("welcome.footer.legalHeading")}
            </Text>
            {links.map((link) => (
              <LandingTextLink
                key={link.key}
                label={link.label}
                onPress={link.onPress}
                underline="always"
              />
            ))}
          </View>
        </View>

        <View style={[styles.bottom, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.rights, { color: colors.textMid }]}>
            {t("welcome.footer.rights", { year: new Date().getFullYear() })}
          </Text>
        </View>
      </PageContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  columns: {
    gap: SPACING.xl,
  },
  columnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: SPACING.xxl,
  },
  brandBlock: {
    gap: SPACING.xs,
    flexShrink: 1,
    maxWidth: 360,
  },
  tagline: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.base,
    lineHeight: 22,
  },
  legalBlock: {
    // Les liens portent leur propre zone tactile de 44 px : un écart
    // supplémentaire les éloignerait inutilement les uns des autres.
    gap: SPACING.xxs,
    alignItems: "flex-start",
  },
  legalHeading: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.xxs,
  },
  bottom: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rights: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.sm,
  },
});
