import { Booking } from "../../types";

/**
 * Libellé de la troisième information clé, qui change de nature selon le type
 * de réservation (numéro de vol, référence hôtel…).
 */
export function getGridThirdLabel(t: (k: string) => string, type: Booking["type"]): string {
  const keys: Partial<Record<Booking["type"], string>> = {
    flight: "bookings.details.gridThirdLabel.flight",
    train: "bookings.details.gridThirdLabel.train",
    hotel: "bookings.details.gridThirdLabel.hotel",
    restaurant: "bookings.details.gridThirdLabel.restaurant",
    activity: "bookings.details.gridThirdLabel.activity",
  };
  const label = keys[type];
  return label ? t(label) : t("bookings.details.gridThirdLabel.default");
}
