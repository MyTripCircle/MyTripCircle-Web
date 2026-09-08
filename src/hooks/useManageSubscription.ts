import { useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { useTranslation } from "react-i18next";

import { ApiError } from "../services/api/apiCore";
import { subscriptionsApi } from "../services/api/subscriptionsApi";
import logger from "../utils/logger";

// Pages de gestion des stores : pertinentes uniquement pour un abonnement
// souscrit via l'App Store ou le Play Store. Dans un navigateur elles n'ont
// aucun sens — l'utilisateur n'y retrouverait pas son abonnement.
const STORE_SUBSCRIPTION_URL =
  Platform.OS === "ios"
    ? "https://apps.apple.com/account/subscriptions"
    : "https://play.google.com/store/account/subscriptions";

// 404 du backend : l'abonnement existe mais vient d'un store mobile, il n'a
// donc pas de client Stripe rattaché.
const NO_STRIPE_CUSTOMER = 404;

/**
 * Ouvre la bonne surface de gestion d'abonnement selon la plateforme :
 * portail de facturation Stripe sur le web, page du store sur mobile.
 */
export function useManageSubscription() {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);

  const openStorePage = async () => {
    try {
      await Linking.openURL(STORE_SUBSCRIPTION_URL);
    } catch (error) {
      logger.warn("[subscription] ouverture de la page du store impossible", error);
      Alert.alert(t("subscription.manageErrorTitle"), t("subscription.manageErrorMessage"));
    }
  };

  const openBillingPortal = async () => {
    setOpening(true);
    try {
      const { url } = await subscriptionsApi.openBillingPortal();
      // Redirection plein écran plutôt qu'un onglet : les bloqueurs de pop-up
      // annulent window.open() hors interaction directe.
      window.location.assign(url);
    } catch (error) {
      const isStoreSubscription =
        error instanceof ApiError && error.status === NO_STRIPE_CUSTOMER;
      logger.warn("[subscription] ouverture du portail Stripe impossible", error);
      Alert.alert(
        t("subscription.manageErrorTitle"),
        isStoreSubscription
          ? t("subscription.manageStoreOnly")
          : t("subscription.manageErrorMessage"),
      );
      setOpening(false);
    }
  };

  const manageSubscription = () =>
    Platform.OS === "web" ? openBillingPortal() : openStorePage();

  return { manageSubscription, opening };
}
