import React, { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/** Adresse du support, également utilisée comme libellé affiché. */
const SUPPORT_EMAIL = "support@mytripcircle.com";

/** Prise de contact avec le support et informations de disponibilité. */
export const HelpContactCard: React.FC<{ fluid?: boolean }> = ({ fluid }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const openEmail = () => {
    const subject = encodeURIComponent(t("helpSupport.emailSubject"));
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`);
  };

  return (
    <View style={fluid ? undefined : styles.block}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("helpSupport.contactSupport")}
        onPress={openEmail}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: hovered || focused ? colors.terraDark : colors.terra,
            // Bordure réservée en permanence : le focus ne décale pas la mise en page.
            borderColor: focused ? colors.text : "transparent",
          },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="mail" size={18} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{t("helpSupport.contactSupport")}</Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={[styles.iconBg, { backgroundColor: colors.bgDark }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textMid} />
          </View>
          <Text style={[styles.text, { color: colors.textMid }]} selectable>
            {SUPPORT_EMAIL}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.bgMid }]} />
        <View style={styles.row}>
          <View style={[styles.iconBg, { backgroundColor: colors.bgDark }]}>
            <Ionicons name="time-outline" size={18} color={colors.textMid} />
          </View>
          <Text style={[styles.text, { color: colors.textMid }]}>
            {t("helpSupport.availability")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: { width: "100%" },
  button: {
    borderRadius: RADIUS.input,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
    cursor: "pointer",
  },
  pressed: { opacity: 0.85 },
  buttonIcon: { marginRight: SPACING.xs },
  buttonText: { color: "#FFFFFF", fontSize: FONT_SIZE.xl, fontFamily: F.sans700 },
  card: { borderRadius: 11, borderWidth: 1, overflow: "hidden", marginBottom: SPACING.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 17,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.input,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  text: { flex: 1, fontSize: FONT_SIZE.lg, fontFamily: F.sans400 },
  divider: { height: 1, marginLeft: 56 },
});
