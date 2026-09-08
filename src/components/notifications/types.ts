import type { TripInvitation } from "../../types";

/**
 * Invitation telle qu'elle sort de l'API.
 *
 * Le document Mongo (`_id`) et les libellés aplatis par le serveur cohabitent
 * avec la forme typée côté application : les déclarer ici évite de propager des
 * accès non typés dans les composants de notification.
 */
export type NotifInvitation = TripInvitation & {
  _id?: string;
  tripName?: string;
  inviterName?: string;
};

/** Identifiant stable d'une invitation, utilisé pour l'état « lu ». */
export const invitationId = (invitation: NotifInvitation): string =>
  invitation._id ?? invitation.token;
