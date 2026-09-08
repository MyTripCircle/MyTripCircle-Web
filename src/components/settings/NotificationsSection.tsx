import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

import { useTheme } from "../../contexts/ThemeContext";
import Toggle from "../ui/Toggle";
import { SettingsCard } from "./SettingsCard";
import { SettingsRow } from "./SettingsRow";

const NOTIF_KEYS = {
  push: "@mytripcircle_notif_push",
  email: "@mytripcircle_notif_email",
  friends: "@mytripcircle_notif_friends",
} as const;

type NotifKey = keyof typeof NOTIF_KEYS;

/** Préférences de notification, persistées localement à chaque bascule. */
export const NotificationsSection: React.FC<{ fluid?: boolean }> = ({ fluid }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    push: true,
    email: true,
    friends: true,
  });

  useEffect(() => {
    const entries = Object.entries(NOTIF_KEYS) as [NotifKey, string][];
    Promise.all(entries.map(([, storageKey]) => AsyncStorage.getItem(storageKey))).then(
      (stored) => {
        setPrefs((current) => {
          const next = { ...current };
          entries.forEach(([key], index) => {
            const raw = stored[index];
            if (raw !== null) next[key] = raw === "true";
          });
          return next;
        });
      },
    );
  }, []);

  const update = (key: NotifKey) => (value: boolean) => {
    setPrefs((current) => ({ ...current, [key]: value }));
    AsyncStorage.setItem(NOTIF_KEYS[key], String(value));
  };

  const rows: { key: NotifKey; emoji: string; label: string }[] = [
    { key: "push", emoji: "🔔", label: t("settings.pushNotifications") },
    { key: "email", emoji: "✉️", label: t("settings.emailReminders") },
    { key: "friends", emoji: "👥", label: t("settings.friendInvitations") },
  ];

  return (
    <SettingsCard fluid={fluid}>
      {rows.map(({ key, emoji, label }) => (
        <SettingsRow
          key={key}
          emoji={emoji}
          title={label}
          control={
            <Toggle
              value={prefs[key]}
              onToggle={update(key)}
              trackColor={colors.terra}
              accessibilityLabel={label}
            />
          }
        />
      ))}
    </SettingsCard>
  );
};
