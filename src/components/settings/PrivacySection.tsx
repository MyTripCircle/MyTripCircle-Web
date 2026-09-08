import React, { useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { RootStackParamList } from "../../types";
import Toggle from "../ui/Toggle";
import { SettingsCard } from "./SettingsCard";
import { SettingsRow } from "./SettingsRow";

/** Visibilité du profil, consentements et documents légaux. */
export const PrivacySection: React.FC<{ fluid?: boolean }> = ({ fluid }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, updateSettings } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [publicProfile, setPublicProfile] = useState(Boolean(user?.isPublicProfile));

  const handlePublicProfileToggle = async (value: boolean) => {
    setPublicProfile(value);
    try {
      await updateSettings({ isPublicProfile: value });
    } catch (e) {
      if (__DEV__) console.warn("[PrivacySection] Erreur mise à jour profil public:", e);
      // L'interrupteur reflète l'état serveur : on le remet en place si l'appel échoue.
      setPublicProfile(!value);
    }
  };

  return (
    <SettingsCard fluid={fluid}>
      <SettingsRow
        emoji="🔒"
        title={t("settings.publicProfile")}
        control={
          <Toggle
            value={publicProfile}
            onToggle={handlePublicProfileToggle}
            trackColor={colors.terra}
            accessibilityLabel={t("settings.publicProfile")}
          />
        }
      />
      <SettingsRow
        emoji="🛡️"
        title={t("settings.myConsents")}
        onPress={() => navigation.navigate("ConsentManagement")}
      />
      <SettingsRow
        emoji="📄"
        title={t("settings.privacyPolicy")}
        onPress={() => navigation.navigate("Privacy")}
      />
      <SettingsRow
        emoji="⚖️"
        title={t("settings.legalNotice")}
        onPress={() => navigation.navigate("LegalNotice")}
      />
    </SettingsCard>
  );
};
