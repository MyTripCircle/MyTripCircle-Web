import type { TFunction } from "i18next";

import type { MainTabParamList, RootStackParamList } from "../types";

type ScreenName = keyof RootStackParamList | keyof MainTabParamList;

/**
 * Clé i18n du titre d'onglet de chaque écran.
 *
 * Le `Record` complet est volontaire : ajouter une route au `RootStackParamList`
 * sans lui donner de titre devient une erreur de compilation.
 */
const PAGE_TITLE_KEYS: Record<ScreenName, string> = {
  // Onglets principaux
  Main: "pageTitle.trips",
  Trips: "pageTitle.trips",
  Bookings: "pageTitle.bookings",
  Ideas: "pageTitle.ideas",
  Addresses: "pageTitle.addresses",
  Profile: "pageTitle.profile",

  // Authentification
  Welcome: "pageTitle.welcome",
  Auth: "pageTitle.auth",
  Otp: "pageTitle.otp",
  ForgotPassword: "pageTitle.forgotPassword",
  Invitation: "pageTitle.invitation",
  FriendInvitation: "pageTitle.friendInvitation",

  // Voyages
  CreateTrip: "pageTitle.createTrip",
  TripDetails: "pageTitle.tripDetails",
  EditTrip: "pageTitle.editTrip",
  TripActions: "pageTitle.tripActions",
  TripMembers: "pageTitle.tripMembers",
  TripPublicView: "pageTitle.tripPublicView",
  InviteFriends: "pageTitle.inviteFriends",
  CalendarExport: "pageTitle.calendarExport",
  FullMap: "pageTitle.fullMap",

  // Réservations, adresses, idées
  BookingDetails: "pageTitle.bookingDetails",
  AddressDetails: "pageTitle.addressDetails",
  AddressForm: "pageTitle.addressForm",
  IdeaDetail: "pageTitle.ideaDetail",

  // Amis
  Friends: "pageTitle.friends",
  AddFriend: "pageTitle.addFriend",
  FriendProfile: "pageTitle.friendProfile",
  FriendRequestConfirmation: "pageTitle.friendRequestConfirmation",

  // Compte
  EditProfile: "pageTitle.editProfile",
  Notifications: "pageTitle.notifications",
  Subscription: "pageTitle.subscription",
  Settings: "pageTitle.settings",
  ChangePassword: "pageTitle.changePassword",
  ConsentManagement: "pageTitle.consentManagement",
  HelpSupport: "pageTitle.helpSupport",

  // Pages légales et erreurs
  Terms: "pageTitle.terms",
  Privacy: "pageTitle.privacy",
  LegalNotice: "pageTitle.legalNotice",
  Consent: "pageTitle.consent",
  NotFound: "pageTitle.notFound",
  Error: "pageTitle.error",
};

const TITLE_SEPARATOR = " · ";

/**
 * Titre de l'onglet du navigateur pour l'écran courant.
 * Retombe sur le seul nom de l'application si la route est inconnue.
 */
export const buildDocumentTitle = (t: TFunction, routeName?: string): string => {
  const appName = t("nav.appName");
  const key = routeName ? PAGE_TITLE_KEYS[routeName as ScreenName] : undefined;
  if (!key) return appName;
  return `${t(key)}${TITLE_SEPARATOR}${appName}`;
};
