/** Regroupements temporels proposés à la lecture, du plus récent au plus ancien. */
export const NOTIF_GROUP_ORDER = ["today", "yesterday", "thisWeek", "earlier"] as const;

export type NotifGroupKey = (typeof NOTIF_GROUP_ORDER)[number];

export interface NotifGroup<T> {
  key: NotifGroupKey;
  items: T[];
}

interface Dated {
  createdAt?: string | Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Minuit du jour concerné : les groupes suivent le calendrier, pas 24 h glissantes. */
const startOfDay = (value: Date): number =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

const resolveGroup = (createdAt: string | Date | undefined, now: Date): NotifGroupKey => {
  if (!createdAt) return "earlier";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "earlier";

  const elapsedDays = Math.floor((startOfDay(now) - startOfDay(date)) / MS_PER_DAY);
  if (elapsedDays <= 0) return "today";
  if (elapsedDays === 1) return "yesterday";
  return elapsedDays < 7 ? "thisWeek" : "earlier";
};

/**
 * Répartit des éléments datés en groupes de lecture.
 *
 * L'instant de référence est injecté pour que le résultat soit reproductible :
 * un regroupement calculé sur `Date.now()` serait intestable.
 * L'ordre d'entrée est conservé à l'intérieur de chaque groupe, et les groupes
 * vides sont omis.
 */
export function groupInvitationsByDate<T extends Dated>(
  items: T[],
  now: Date = new Date(),
): NotifGroup<T>[] {
  const buckets = new Map<NotifGroupKey, T[]>();

  items.forEach((item) => {
    const key = resolveGroup(item.createdAt, now);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  });

  return NOTIF_GROUP_ORDER.filter((key) => buckets.has(key)).map((key) => ({
    key,
    items: buckets.get(key) ?? [],
  }));
}
