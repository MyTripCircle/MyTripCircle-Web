import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

/** Champ de mot de passe : libellé associé, saisie masquée et bascule d'affichage. */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTabletUp } = useBreakpoint();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const toggleLabel = visible
    ? t("changePassword.hidePassword")
    : t("changePassword.showPassword");

  // L'anneau de focus s'adresse à la navigation au clavier : inutile sur
  // mobile tactile, où il modifierait le rendu d'origine pendant la saisie.
  const highlighted = focused && isTabletUp;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.surface,
            borderColor: highlighted ? colors.terra : colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.textLight }]}>{label}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.value, { color: colors.text }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            secureTextEntry={!visible}
            autoCapitalize="none"
            accessibilityLabel={label}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={toggleLabel}
            onPress={() => setVisible((current) => !current)}
            style={styles.eye}
          >
            <Ionicons
              name={visible ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.textLight}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  box: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingTop: SPACING.sm,
    paddingBottom: 10,
  },
  label: { fontSize: FONT_SIZE.sm, marginBottom: 2, fontFamily: F.sans500 },
  row: { flexDirection: "row", alignItems: "center" },
  value: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    paddingVertical: SPACING.xxs,
    fontFamily: F.sans400,
  },
  eye: { padding: SPACING.xxs, marginLeft: SPACING.xxs, cursor: "pointer" },
});
