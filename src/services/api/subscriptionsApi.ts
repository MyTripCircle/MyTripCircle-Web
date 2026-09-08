import { request } from "./apiCore";

export const subscriptionsApi = {
  getSubscription: () => request<any>("/subscriptions/me"),

  validatePurchase: (data: {
    receiptData: string;
    platform: string;
    productId: string;
    transactionId?: string;
  }) => request<{ success: boolean; message?: string }>("/subscriptions/validate", "POST", data),

  cancelSubscription: () =>
    request<{ success: boolean; message?: string }>("/subscriptions/cancel", "POST"),

  // Portail Stripe : moyen de paiement, factures et résiliation. Réservé aux
  // abonnements souscrits sur le web ; renvoie 404 pour un abonnement mobile.
  openBillingPortal: () =>
    request<{ url: string }>("/subscriptions/billing-portal", "POST"),
};
