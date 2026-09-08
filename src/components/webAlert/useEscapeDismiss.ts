import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Ferme la boîte de dialogue sur Échap.
 *
 * `onEscape` vaut `undefined` quand l'alerte n'offre aucune échappatoire : la
 * modale reste alors bloquante, comme le dialogue système sur mobile.
 */
export const useEscapeDismiss = (onEscape?: () => void): void => {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined" || !onEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onEscape();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);
};
