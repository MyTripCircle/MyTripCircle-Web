import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { request } from "../services/api/apiCore";
import logger from "../utils/logger";

/**
 * Les identifiants restent alignés sur ceux des stores : le backend fait
 * lui-même la correspondance vers les prix Stripe correspondants.
 */
const MONTHLY_ID = "com.myapp.monthly";
const YEARLY_ID  = "com.myapp.yearly";

interface WebProduct {
  productId: string;
  title: string;
  localizedPrice: string;
}

/**
 * `Alert.alert` est un no-op dans react-native-web : les erreurs de paiement
 * passent donc par la boîte de dialogue native du navigateur.
 */
const showBrowserAlert = (title: string, message: string): void => {
  window.alert(`${title}\n\n${message}`);
};

/**
 * Variante web de l'achat d'abonnement : pas de store in-app, on ouvre une
 * session Stripe Checkout créée par le backend. Même forme de retour que la
 * version native pour que SubscriptionScreen reste inchangé.
 */
export function useSubscriptionIap() {
  const { t } = useTranslation();

  const products = useMemo<WebProduct[]>(
    () => [
      { productId: MONTHLY_ID, title: t("subscription.monthly"), localizedPrice: t("subscription.monthlyPrice") },
      { productId: YEARLY_ID,  title: t("subscription.annual"),  localizedPrice: t("subscription.annualPrice")  },
    ],
    [t],
  );

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onSubscribe = async (productId: string) => {
    try {
      setLoadingId(productId);
      const { url } = await request<{ url: string }>(
        "/subscriptions/checkout-session",
        "POST",
        { productId },
      );
      if (!url) throw new Error("checkout-session sans URL de redirection");
      // La page quitte l'application : on garde volontairement l'état de chargement.
      window.location.assign(url);
    } catch (error) {
      logger.warn("[useSubscriptionIap.web] session Stripe Checkout indisponible", error);
      showBrowserAlert(t("subscription.purchaseErrorTitle"), t("subscription.checkoutErrorMessage"));
      setLoadingId(null);
    }
  };

  // Expo Go n'existe pas sur web : le bandeau « mode démo » reste masqué.
  return { products, loadingId, onSubscribe, isExpoGo: false };
}
