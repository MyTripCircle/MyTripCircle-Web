import { useEffect, useState } from "react";
import * as Location from "expo-location";

/**
 * Variante web de useCurrentLocation.
 *
 * `expo-location` fournit bien une implémentation navigateur, mais son
 * `getForegroundPermissionsAsync` lève une `UnavailabilityError` dès que
 * `navigator.permissions` est absent (Safari < 16, contextes non sécurisés).
 * La version native ne pouvant pas échouer ainsi, l'appel n'est pas protégé et
 * l'erreur remonterait en rejet de promesse non capturé au montage de l'écran.
 * Cette variante conserve exactement la même logique — on lit une autorisation
 * déjà accordée, sans jamais déclencher de pop-up navigateur — et se contente
 * d'absorber l'indisponibilité : l'app fonctionne sans position.
 */

// Redéclaré ici plutôt qu'importé : Metro résoudrait `./useCurrentLocation`
// vers ce fichier même sur la plateforme web.
export interface Coords {
  lat: number;
  lng: number;
}

export const useCurrentLocation = (): Coords | null => {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch (e) {
        if (__DEV__) console.warn("[useCurrentLocation.web] Géolocalisation indisponible:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
};
