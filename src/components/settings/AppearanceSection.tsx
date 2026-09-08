import React from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import { changeLanguage } from "../../utils/i18n";
import Toggle from "../ui/Toggle";
import { SettingsCard } from "./SettingsCard";
import { SettingsRow } from "./SettingsRow";

/** Thème, fond de carte et langue de l'interface. */
export const AppearanceSection: React.FC<{ fluid?: boolean }> = ({ fluid }) => {
  const { t, i18n } = useTranslation();
  const { isDark, colors, toggleTheme, satelliteMap, toggleSatelliteMap } = useTheme();

  const currentLangLabel =
    i18n.language === "fr" ? t("settings.languageFr") : t("settings.languageEn");

  const handleLanguagePress = () => {
    Alert.alert(t("settings.languageSelectTitle"), t("settings.languageSelectMessage"), [
      { text: t("settings.languageFr"), onPress: () => changeLanguage("fr") },
      { text: t("settings.languageEn"), onPress: () => changeLanguage("en") },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  return (
    <SettingsCard fluid={fluid}>
      <SettingsRow
        emoji={isDark ? "🌙" : "☀️"}
        title={t("settings.darkMode")}
        control={
          <Toggle
            value={isDark}
            onToggle={() => toggleTheme()}
            trackColor={colors.terra}
            accessibilityLabel={t("settings.darkMode")}
          />
        }
      />
      <SettingsRow
        emoji="🛰️"
        title={t("settings.satelliteMap")}
        control={
          <Toggle
            value={satelliteMap}
            onToggle={() => toggleSatelliteMap()}
            trackColor={colors.terra}
            accessibilityLabel={t("settings.satelliteMap")}
          />
        }
      />
      <SettingsRow
        emoji="🌐"
        title={t("settings.language")}
        value={currentLangLabel}
        onPress={handleLanguagePress}
      />
    </SettingsCard>
  );
};
