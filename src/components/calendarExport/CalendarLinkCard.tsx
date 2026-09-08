import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface CalendarLinkCardProps {
  /** Lien d'abonnement, `null` tant qu'aucun jeton n'a été généré. */
  url: string | null;
  loading: boolean;
  working: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
}

/** Lien iCal personnel : génération, copie et révocation. */
export const CalendarLinkCard: React.FC<CalendarLinkCardProps> = ({
  url,
  loading,
  working,
  onGenerate,
  onCopy,
  onRegenerate,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const renderBody = () => {
    if (loading) {
      return (
        <Text style={[styles.placeholder, { color: colors.textLight }]}>
          {t("common.loading")}
        </Text>
      );
    }

    if (!url) {
      return (
        <TouchableOpacity
          style={[styles.primary, { backgroundColor: colors.terra }]}
          onPress={onGenerate}
          activeOpacity={0.8}
          disabled={working}
          accessibilityRole="button"
          accessibilityLabel={t("calendar.generateBtn")}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.primaryText}>
            {working ? t("calendar.generating") : t("calendar.generateBtn")}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <>
        <View style={[styles.urlBox, { backgroundColor: colors.bgMid }]}>
          <Text style={[styles.url, { color: colors.text }]} numberOfLines={2} selectable>
            {url}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.primary, { backgroundColor: colors.terra }]}
          onPress={onCopy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("calendar.copyBtn")}
        >
          <Ionicons name="copy-outline" size={18} color="#fff" />
          <Text style={styles.primaryText}>{t("calendar.copyBtn")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondary, { borderColor: colors.danger + "60" }]}
          onPress={onRegenerate}
          activeOpacity={0.8}
          disabled={working}
          accessibilityRole="button"
          accessibilityLabel={t("calendar.regenerateBtn")}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.danger} />
          <Text style={[styles.secondaryText, { color: colors.danger }]}>
            {working ? t("calendar.generating") : t("calendar.regenerateBtn")}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm },
  placeholder: {
    fontSize: FONT_SIZE.md,
    fontFamily: F.sans400,
    textAlign: "center",
    paddingVertical: SPACING.xs,
  },
  urlBox: { borderRadius: RADIUS.input, padding: SPACING.sm },
  url: { fontSize: FONT_SIZE.sm, fontFamily: F.sans400, lineHeight: 20 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    cursor: "pointer",
  },
  primaryText: { fontSize: FONT_SIZE.lg, fontFamily: F.sans600, color: "#fff" },
  secondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    cursor: "pointer",
  },
  secondaryText: { fontSize: FONT_SIZE.base, fontFamily: F.sans500 },
});
