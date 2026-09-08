const FREE_FEATURES = {
  maxTrips: 3,
  maxCollaborators: 2,
  canExport: false,
  prioritySupport: false,
  maxAttachments: 2,
};

const PREMIUM_FEATURES = {
  maxTrips: -1,
  maxCollaborators: -1,
  canExport: true,
  prioritySupport: true,
  maxAttachments: -1,
};

/**
 * Persiste un abonnement premium actif. Partagé par l'IAP mobile et Stripe web
 * pour que la forme du document en base ne dépende pas du canal d'achat.
 */
async function upsertPremiumSubscription(db, { userId, platform, productId, endDate, extra = {} }) {
  const now = new Date();
  const subscription = {
    userId: String(userId),
    plan: "premium",
    status: "active",
    platform,
    productId,
    features: PREMIUM_FEATURES,
    startDate: now,
    endDate,
    nextBillingDate: endDate,
    cancelledAt: null,
    updatedAt: now,
    ...extra,
  };

  await db.collection("subscriptions").updateOne(
    { userId: String(userId) },
    { $set: subscription, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );

  return subscription;
}

async function getUserFeatures(db, userId) {
  const sub = await db.collection("subscriptions").findOne({ userId });
  if (!sub) return { ...FREE_FEATURES };

  const isActive =
    sub.status === "active" ||
    (sub.status === "cancelled" &&
      sub.endDate &&
      new Date(sub.endDate) > new Date());

  return isActive ? sub.features : { ...FREE_FEATURES };
}

module.exports = { FREE_FEATURES, PREMIUM_FEATURES, getUserFeatures, upsertPremiumSubscription };
