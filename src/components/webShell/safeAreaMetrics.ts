import { Dimensions } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";
import type { Metrics } from "react-native-safe-area-context";

/**
 * Métriques initiales du `SafeAreaProvider`.
 *
 * Sur web `initialWindowMetrics` vaut toujours `null` : sans valeur de départ,
 * le provider ne rend aucun enfant tant que la mesure du DOM n'est pas revenue,
 * ce qui produit une frame blanche au chargement. Les insets y sont nuls sur
 * navigateur de bureau, et la vraie mesure (encoche iOS en mode standalone)
 * écrase ces valeurs dès le premier effet.
 */
export const getInitialSafeAreaMetrics = (): Metrics => {
  if (initialWindowMetrics) return initialWindowMetrics;

  const { width, height } = Dimensions.get("window");
  return {
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
    frame: { x: 0, y: 0, width, height },
  };
};
