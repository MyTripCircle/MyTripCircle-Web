import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type SettingsSectionKey = "notifications" | "privacy" | "appearance" | "account";

export interface SettingsSectionDef {
  key: SettingsSectionKey;
  /** Libellé de la navigation desktop (casse normale). */
  navLabelKey: string;
  /** Libellé du groupe dans la liste mobile (capitales), absent pour le compte. */
  groupLabelKey?: string;
  icon: IoniconName;
  iconActive: IoniconName;
}

/**
 * Sections de réglages, dans l'ordre d'affichage.
 *
 * La même liste pilote la navigation latérale desktop et l'empilement mobile :
 * ajouter une section ne demande qu'une entrée ici.
 */
export const SETTINGS_SECTIONS: SettingsSectionDef[] = [
  {
    key: "notifications",
    navLabelKey: "settings.nav.notifications",
    groupLabelKey: "settings.sections.notifications",
    icon: "notifications-outline",
    iconActive: "notifications",
  },
  {
    key: "privacy",
    navLabelKey: "settings.nav.privacy",
    groupLabelKey: "settings.sections.privacy",
    icon: "lock-closed-outline",
    iconActive: "lock-closed",
  },
  {
    key: "appearance",
    navLabelKey: "settings.nav.appearance",
    groupLabelKey: "settings.sections.appearance",
    icon: "color-palette-outline",
    iconActive: "color-palette",
  },
  {
    key: "account",
    navLabelKey: "settings.nav.account",
    icon: "person-outline",
    iconActive: "person",
  },
];
