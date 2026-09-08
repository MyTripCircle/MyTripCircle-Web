import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../../theme";
import BackButton from "../ui/BackButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Boutons d'action de la page, alignés à droite sur desktop. */
  actions?: React.ReactNode;
  /**
   * Retour arrière. Sur desktop la navigation latérale et l'historique du
   * navigateur suffisent : le bouton n'est rendu qu'en dessous de ce palier,
   * sauf `alwaysShowBack` pour les écrans hors navigation (formulaires, détail
   * ouvert depuis un lien direct).
   */
  onBack?: () => void;
  alwaysShowBack?: boolean;
}

/**
 * En-tête de page.
 *
 * Deux grammaires selon le support : sur mobile, un bandeau compact avec bouton
 * retour et titre centré ; sur desktop, un titre de page à gauche et les
 * actions à droite, comme sur n'importe quel site.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  onBack,
  alwaysShowBack = false,
}) => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  if (!isDesktopUp) {
    return (
      <View style={styles.mobileRoot}>
        {onBack ? <BackButton onPress={onBack} /> : <View style={styles.spacer} />}
        <Text style={[styles.mobileTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.spacer}>{actions}</View>
      </View>
    );
  }

  return (
    <View style={styles.desktopRoot}>
      <View style={styles.titleBlock}>
        {(alwaysShowBack && onBack) && (
          <View style={styles.desktopBack}>
            <BackButton onPress={onBack} />
          </View>
        )}
        <View style={styles.titles}>
          <Text style={[styles.desktopTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMid }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mobileRoot: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  mobileTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FONT_SIZE.h3,
    fontFamily: F.sans700,
  },
  spacer: { width: 44, alignItems: "flex-end" },

  desktopRoot: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  titleBlock: { flexDirection: "row", alignItems: "center", flexShrink: 1, gap: SPACING.sm },
  desktopBack: { marginRight: SPACING.xxs },
  titles: { flexShrink: 1 },
  desktopTitle: { fontSize: FONT_SIZE.hero, fontFamily: F.sans700 },
  subtitle: { fontSize: FONT_SIZE.lg, fontFamily: F.sans400, marginTop: SPACING.xxs },
  actions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
});
