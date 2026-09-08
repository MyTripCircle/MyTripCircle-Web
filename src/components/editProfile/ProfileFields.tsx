import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface ProfileFieldsProps {
  name: string;
  email: string;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  /** Supprime la marge horizontale, quand un conteneur de page la fournit déjà. */
  fluid?: boolean;
}

/** Champs d'identité : nom affiché et adresse e-mail. */
export const ProfileFields: React.FC<ProfileFieldsProps> = ({
  name,
  email,
  onChangeName,
  onChangeEmail,
  fluid,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        fluid && styles.cardFluid,
      ]}
    >
      <View style={styles.group}>
        <Text style={[styles.label, { color: colors.textLight }]}>{t("common.fullName")}</Text>
        <View style={styles.inputRow}>
          <Ionicons
            name="person-outline"
            size={18}
            color={colors.textLight}
            style={styles.icon}
          />
          <TextInput
            value={name}
            onChangeText={onChangeName}
            style={[styles.input, { color: colors.text }]}
            placeholder={t("editProfile.namePlaceholder")}
            placeholderTextColor={colors.textLight}
            accessibilityLabel={t("common.fullName")}
          />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.bgMid }]} />

      <View style={styles.group}>
        <Text style={[styles.label, { color: colors.textLight }]}>{t("common.email")}</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color={colors.textLight} style={styles.icon} />
          <TextInput
            value={email}
            onChangeText={onChangeEmail}
            style={[styles.input, { color: colors.text }]}
            placeholder={t("editProfile.emailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textLight}
            accessibilityLabel={t("common.email")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  cardFluid: { marginHorizontal: 0 },
  group: { paddingHorizontal: SPACING.md, paddingVertical: 14 },
  label: {
    fontSize: FONT_SIZE.xxs,
    fontFamily: F.sans600,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: FONT_SIZE.base, paddingVertical: 0, fontFamily: F.sans400 },
  divider: { height: 1, marginHorizontal: SPACING.md },
});
