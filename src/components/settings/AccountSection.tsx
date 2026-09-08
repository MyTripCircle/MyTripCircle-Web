import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";
import { SETTINGS_GUTTER, settingsStyles } from "./settingsStyles";

/** Bordure de la zone dangereuse, plus soutenue que `dangerLight` seul. */
const DANGER_BORDER = { light: "#F0D0C8", dark: "#4A2020" } as const;

/** Zone dangereuse : suppression du compte, avec délai de rétractation. */
export const AccountSection: React.FC<{ fluid?: boolean }> = ({ fluid }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { deleteAccount } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const runDeletion = async () => {
    const result = await deleteAccount();
    if (result.success) {
      Alert.alert(
        t("settings.deleteAccountScheduledTitle"),
        t("settings.deleteAccountScheduledMessage"),
        [{ text: t("common.ok") }],
      );
      return;
    }
    Alert.alert(t("common.error"), t("settings.deleteAccountError"));
  };

  const confirmDeletion = () => {
    Alert.alert(t("settings.deleteAccountTitle"), t("settings.deleteAccountMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: runDeletion },
    ]);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("settings.deleteAccount")}
      onPress={confirmDeletion}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        settingsStyles.clickable,
        {
          backgroundColor: colors.dangerLight,
          borderColor: focused ? colors.danger : DANGER_BORDER[isDark ? "dark" : "light"],
        },
        fluid && styles.rowFluid,
        (hovered || focused) && styles.highlighted,
        pressed && settingsStyles.pressed,
      ]}
    >
      <Text style={styles.emoji}>🗑</Text>
      <Text style={[styles.label, { color: colors.danger }]}>
        {t("settings.deleteAccount")}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SETTINGS_GUTTER,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  /** Dans un panneau, l'espacement et la marge viennent de la colonne de contenu. */
  rowFluid: { marginHorizontal: 0, marginTop: 0 },
  // Le survol ne repose pas sur la seule couleur : la bordure s'épaissit aussi.
  highlighted: { borderWidth: 2, paddingVertical: 13, paddingHorizontal: 15 },
  emoji: { fontSize: 24 },
  label: { fontFamily: F.sans500, fontSize: FONT_SIZE.xxl },
});
