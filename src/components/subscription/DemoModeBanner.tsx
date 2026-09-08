import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/** Bandeau signalant que les achats intégrés sont indisponibles (Expo Go). */
const DemoModeBanner: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.terraLight, borderColor: colors.terra }]}>
      <Ionicons
        name="alert-circle-outline"
        size={20}
        color={colors.terra}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.terraDark }]}>
          {t("subscription.demoMode")}
        </Text>
        <Text style={[styles.text, { color: colors.textMid }]}>
          {t("subscription.demoMessage")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  icon: { marginTop: 2 },
  content: { flex: 1 },
  title: { fontSize: FONT_SIZE.md, fontFamily: F.sans700, marginBottom: SPACING.xxs },
  text: { fontSize: FONT_SIZE.sm, fontFamily: F.sans400, lineHeight: 19 },
});

export default DemoModeBanner;
