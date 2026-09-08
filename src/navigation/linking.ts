import { Platform } from "react-native";
import type { LinkingOptions } from "@react-navigation/native";

import type { RootStackParamList } from "../types";

// Hôte historique des liens transactionnels (invitations, réinitialisation de
// mot de passe) : déclaré aussi dans les intentFilters Android de app.json.
const DEEP_LINK_HOSTS = ["mytripcircle://", "https://mytripcircle-api.enzo-turpin.fr"];

/**
 * Sur web, l'origine réelle varie (localhost, préprod, production) : on la lit
 * au moment du chargement plutôt que de la figer dans le code.
 */
const resolveWebOrigin = (): string[] => {
  if (Platform.OS !== "web" || typeof window === "undefined") return [];
  return [window.location.origin];
};

// Les paramètres transitent par l'URL sous forme de chaînes : sans conversion
// explicite, `?readOnly=false` deviendrait la chaîne "false", donc truthy.
const parseBoolean = (value: string): boolean => value === "true" || value === "1";

const parseCount = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [...DEEP_LINK_HOSTS, ...resolveWebOrigin()],
  config: {
    // Une URL profonde ouverte à froid n'empile qu'un seul écran : replacer
    // `Main` en dessous garantit un retour arrière cohérent (app et navigateur).
    initialRouteName: "Main",
    screens: {
      // ── Onglets principaux ──────────────────────────────────────────────
      Main: {
        screens: {
          Trips: "voyages",
          Bookings: "reservations",
          Ideas: "idees",
          Addresses: "adresses",
          Profile: "profil",
        },
      },

      // ── Authentification ────────────────────────────────────────────────
      Welcome: "bienvenue",
      Auth: "connexion",
      Otp: "verification/:userId",

      // ── Liens déjà diffusés par e-mail : chemins figés ──────────────────
      Invitation: "invitation/:token",
      FriendInvitation: "friend-invite/:token",
      ForgotPassword: {
        path: "reset-password", // NOSONAR — chemin de deep link, pas un secret
        parse: { code: (code: string) => code },
      },

      // ── Voyages ─────────────────────────────────────────────────────────
      CreateTrip: "voyages/nouveau",
      TripDetails: {
        path: "voyages/:tripId",
        parse: { showValidateButton: parseBoolean, showToast: parseBoolean },
      },
      EditTrip: "voyages/:tripId/modifier",
      TripMembers: "voyages/:tripId/membres",
      InviteFriends: "voyages/:tripId/inviter",
      TripPublicView: "voyages/:tripId/apercu",
      TripActions: {
        path: "voyages/:tripId/actions",
        // Les dates arrivent déjà en ISO depuis les appelants : seuls les
        // compteurs et le drapeau propriétaire demandent une conversion.
        parse: {
          totalBookings: parseCount,
          totalAddresses: parseCount,
          isOwner: parseBoolean,
        },
      },
      CalendarExport: "export-calendrier",
      FullMap: "carte",

      // ── Réservations ────────────────────────────────────────────────────
      BookingDetails: {
        path: "reservations/:bookingId",
        parse: { readOnly: parseBoolean },
      },

      // ── Adresses ────────────────────────────────────────────────────────
      AddressForm: "adresses/formulaire",
      AddressDetails: "adresses/:addressId",

      // ── Idées ───────────────────────────────────────────────────────────
      IdeaDetail: "idees/:ideaId",

      // ── Amis ────────────────────────────────────────────────────────────
      Friends: "amis",
      AddFriend: "amis/ajouter",
      FriendRequestConfirmation: {
        path: "amis/demande-envoyee",
        parse: { autoAccepted: parseBoolean },
      },
      FriendProfile: "amis/:friendId",

      // ── Compte ──────────────────────────────────────────────────────────
      EditProfile: "profil/modifier",
      Notifications: "notifications",
      Subscription: "abonnement",
      Settings: "reglages",
      ChangePassword: "reglages/mot-de-passe",
      ConsentManagement: "reglages/consentements",
      HelpSupport: "aide",

      // ── Pages légales ───────────────────────────────────────────────────
      Terms: "conditions-utilisation",
      Privacy: "confidentialite",
      LegalNotice: "mentions-legales",
      Consent: "consentement",

      // ── Erreurs ─────────────────────────────────────────────────────────
      Error: { path: "erreur", parse: { canGoBack: parseBoolean } },
      // Doit rester en dernier : capte toute URL non reconnue.
      NotFound: "*",
    },
  },
};
