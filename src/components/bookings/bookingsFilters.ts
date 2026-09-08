import { Booking } from "../../types";

/** Filtre de la liste des réservations : « toutes » ou un type de réservation. */
export type BookingFilterType = "all" | Booking["type"];

// Ordre d'affichage des pastilles de filtre, partagé par la barre et l'écran.
export const BOOKING_FILTERS: BookingFilterType[] = [
  "all",
  "flight",
  "train",
  "hotel",
  "restaurant",
  "activity",
];
