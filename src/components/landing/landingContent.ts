import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface LandingEntry {
  /** Identifiant stable, utilisé comme clé de liste. */
  key: string;
  icon: IoniconName;
  titleKey: string;
  bodyKey: string;
}

/**
 * Fonctionnalités présentées sur la page d'accueil publique.
 *
 * Chaque entrée décrit une capacité réellement livrée par l'application : la
 * liste est volontairement dérivée du produit existant, pas d'une promesse
 * commerciale. Six entrées se répartissent proprement en 2 ou 3 colonnes.
 */
export const LANDING_FEATURES: LandingEntry[] = [
  {
    key: "collaborative",
    icon: "people",
    titleKey: "welcome.features.collaborative.title",
    bodyKey: "welcome.features.collaborative.body",
  },
  {
    key: "bookings",
    icon: "calendar",
    titleKey: "welcome.features.bookings.title",
    bodyKey: "welcome.features.bookings.body",
  },
  {
    key: "scan",
    icon: "qr-code",
    titleKey: "welcome.features.scan.title",
    bodyKey: "welcome.features.scan.body",
  },
  {
    key: "itinerary",
    icon: "sparkles",
    titleKey: "welcome.features.itinerary.title",
    bodyKey: "welcome.features.itinerary.body",
  },
  {
    key: "addresses",
    icon: "location",
    titleKey: "welcome.features.addresses.title",
    bodyKey: "welcome.features.addresses.body",
  },
  {
    key: "friends",
    icon: "person-add",
    titleKey: "welcome.features.friends.title",
    bodyKey: "welcome.features.friends.body",
  },
];

/** Parcours réel d'un voyage, de sa création à l'export vers l'agenda. */
export const LANDING_STEPS: LandingEntry[] = [
  {
    key: "create",
    icon: "airplane",
    titleKey: "welcome.steps.create.title",
    bodyKey: "welcome.steps.create.body",
  },
  {
    key: "invite",
    icon: "mail-open",
    titleKey: "welcome.steps.invite.title",
    bodyKey: "welcome.steps.invite.body",
  },
  {
    key: "travel",
    icon: "checkmark-done",
    titleKey: "welcome.steps.travel.title",
    bodyKey: "welcome.steps.travel.body",
  },
];

/** Arguments repris sur le panneau latéral des écrans d'authentification. */
export const AUTH_ASIDE_BULLETS: Array<{ key: string; icon: IoniconName; textKey: string }> = [
  { key: "shared", icon: "layers-outline", textKey: "auth.aside.bullet1" },
  { key: "roles", icon: "people-outline", textKey: "auth.aside.bullet2" },
  { key: "calendar", icon: "calendar-outline", textKey: "auth.aside.bullet3" },
];
