import React from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PageContainer } from "../layout";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, SPACING } from "../../theme";

interface ErrorPageLayoutProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  /** Code HTTP mis en avant, pour les pages qui en ont un (404). */
  code?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Gabarit des pages d'erreur : bloc unique centré dans la fenêtre.
 *
 * Partagé par « erreur » et « page introuvable », qui ne diffèrent que par leur
 * illustration et leurs libellés. Les actions passent en ligne à partir du
 * palier tablette, comme sur n'importe quelle page d'erreur web.
 */
export const ErrorPageLayout: React.FC<ErrorPageLayoutProps> = ({
  icon,
  iconColor,
  iconBackground,
  code,
  title,
  description,
  children,
}) => {
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <View style={styles.centered}>
        <PageContainer width="narrow" style={styles.column}>
          <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
            <Ionicons name={icon} size={56} color={iconColor} />
          </View>

          {code ? <Text style={[styles.code, { color: colors.textLight }]}>{code}</Text> : null}
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: colors.textMid }]}>{description}</Text>

          <View style={[styles.actions, isTabletUp && styles.actionsRow]}>{children}</View>
        </PageContainer>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 48,
  },
  /**
   * La marge horizontale d'origine est conservée et la colonne plafonnée bien en
   * dessous de `narrow` : une page d'erreur est un bloc, pas un texte à lire.
   */
  column: {
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    maxWidth: 460,
  },
  iconContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  code: {
    fontSize: 72,
    fontFamily: F.sans700,
    lineHeight: 80,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.h2,
    fontFamily: F.sans700,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.lg,
    fontFamily: F.sans400,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  actions: { width: "100%", alignItems: "center" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
  },
});
