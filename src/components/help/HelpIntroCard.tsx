import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/** Accroche du centre d'aide : à qui l'on s'adresse et pour quoi. */
export const HelpIntroCard: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.terra} />
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {t("helpSupport.needHelp")}
        </Text>
      </View>
      <Text style={[styles.paragraph, { color: colors.textMid }]}>
        {t("helpSupport.description")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 11,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(196,113,74,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  title: { fontSize: 19, fontFamily: F.sans700 },
  paragraph: {
    fontSize: FONT_SIZE.lg,
    lineHeight: 26,
    fontFamily: F.sans400,
    marginBottom: SPACING.xs,
  },
});
