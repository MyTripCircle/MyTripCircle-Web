import type { useTheme } from "../../../contexts/ThemeContext";

export type Colors = ReturnType<typeof useTheme>["colors"];

/** Créneau d'une journée renvoyé par la génération d'itinéraire. */
export interface ItinerarySlot {
  activity: string;
  tip?: string;
  /** Nom de lieu précis, exploité à la création des réservations. */
  place?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning?: ItinerarySlot;
  afternoon?: ItinerarySlot;
  evening?: ItinerarySlot;
}

export interface GeneratedItinerary {
  city: string;
  days?: ItineraryDay[];
}
