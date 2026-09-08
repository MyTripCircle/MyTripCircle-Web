import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface SecurityCardProps {
  onChangePassword: () => void;
  /** Supprime la marge horizontale, quand un conteneur de page la fournit déjà. */
  fluid?: boolean;
}

/** Accès aux réglages de sécurité du compte depuis le formulaire de profil. */
export const SecurityCard: React.FC<SecurityCardProps> = ({ onChangePassword, fluid }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        fluid && styles.cardFluid,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("editProfile.changePassword")}
        onPress={onChangePassword}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.row,
          (hovered || focused) && { backgroundColor: colors.bg },
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[styles.focusMarker, { backgroundColor: focused ? colors.terra : "transparent" }]}
        />
        <View style={styles.left}>
          <View style={[styles.iconBg, { backgroundColor: colors.terraLight }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.terra} />
          </View>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("editProfile.changePassword")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    overflow: "hidden",
  },
  cardFluid: { marginHorizontal: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    cursor: "pointer",
  },
  // Repère de focus en absolu : visible sans décaler la ligne.
  focusMarker: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  pressed: { opacity: 0.7 },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  label: { fontSize: FONT_SIZE.base, fontFamily: F.sans600 },
});
