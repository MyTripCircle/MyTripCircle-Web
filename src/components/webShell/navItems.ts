import { Ionicons } from "@expo/vector-icons";

import type { MainTabParamList, RootStackParamList } from "../../types";

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Écrans racine sans paramètre atteignables depuis la navigation latérale. */
type SidebarScreen = Extract<keyof RootStackParamList, "Friends" | "Settings">;

export type WebNavTarget =
  | { kind: "tab"; tab: keyof MainTabParamList }
  | { kind: "screen"; screen: SidebarScreen };

export interface WebNavItem {
  /** Identifiant stable de la section, utilisé pour le surlignage actif. */
  key: string;
  labelKey: string;
  icon: IoniconName;
  iconActive: IoniconName;
  target: WebNavTarget;
  /**
   * Routes rattachées à la section. Ouvrir « Détails du voyage » doit continuer
   * de surligner « Voyages » dans la barre latérale.
   */
  matches: string[];
}

export const PRIMARY_NAV_ITEMS: WebNavItem[] = [
  {
    key: "trips",
    labelKey: "tabs.myTrips",
    icon: "airplane-outline",
    iconActive: "airplane",
    target: { kind: "tab", tab: "Trips" },
    matches: [
      "Trips",
      "TripDetails",
      "CreateTrip",
      "EditTrip",
      "TripActions",
      "TripMembers",
      "InviteFriends",
      "TripPublicView",
      "CalendarExport",
      "FullMap",
    ],
  },
  {
    key: "bookings",
    labelKey: "tabs.bookings",
    icon: "calendar-outline",
    iconActive: "calendar",
    target: { kind: "tab", tab: "Bookings" },
    matches: ["Bookings", "BookingDetails"],
  },
  {
    key: "ideas",
    labelKey: "tabs.ideas",
    icon: "bulb-outline",
    iconActive: "bulb",
    target: { kind: "tab", tab: "Ideas" },
    matches: ["Ideas", "IdeaDetail"],
  },
  {
    key: "addresses",
    labelKey: "tabs.addresses",
    icon: "location-outline",
    iconActive: "location",
    target: { kind: "tab", tab: "Addresses" },
    matches: ["Addresses", "AddressDetails", "AddressForm"],
  },
  {
    key: "friends",
    labelKey: "pageTitle.friends",
    icon: "people-outline",
    iconActive: "people",
    target: { kind: "screen", screen: "Friends" },
    matches: ["Friends", "FriendProfile", "AddFriend", "FriendRequestConfirmation"],
  },
];

export const ACCOUNT_NAV_ITEMS: WebNavItem[] = [
  {
    key: "profile",
    labelKey: "tabs.profile",
    icon: "person-outline",
    iconActive: "person",
    target: { kind: "tab", tab: "Profile" },
    matches: ["Profile", "EditProfile", "Subscription", "Notifications"],
  },
  {
    key: "settings",
    labelKey: "pageTitle.settings",
    icon: "settings-outline",
    iconActive: "settings",
    target: { kind: "screen", screen: "Settings" },
    matches: [
      "Settings",
      "ChangePassword",
      "ConsentManagement",
      "HelpSupport",
      "Terms",
      "Privacy",
      "LegalNotice",
    ],
  },
];

const ALL_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...ACCOUNT_NAV_ITEMS];

/**
 * Section de la barre latérale correspondant à la route affichée.
 * `undefined` signale une route hors application (authentification, erreurs) :
 * le shell s'efface alors complètement.
 */
export const findActiveNavKey = (routeName?: string): string | undefined => {
  if (!routeName) return undefined;
  return ALL_NAV_ITEMS.find((item) => item.matches.includes(routeName))?.key;
};
