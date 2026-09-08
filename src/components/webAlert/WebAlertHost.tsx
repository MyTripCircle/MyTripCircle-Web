import React, { useCallback, useSyncExternalStore } from "react";

import {
  dequeueWebAlert,
  getWebAlertQueue,
  subscribeToWebAlerts,
  type WebAlertButton,
} from "./alertQueue";
import { WebAlertDialog } from "./WebAlertDialog";

/**
 * Hôte unique des alertes web : monté une seule fois à la racine de
 * l'application, il affiche la première demande de la file et enchaîne sur la
 * suivante à la fermeture.
 *
 * Tant que `installWebAlert` n'a pas été appelé (natif), la file reste vide et
 * ce composant ne rend rien.
 */
export const WebAlertHost: React.FC = () => {
  const queue = useSyncExternalStore(subscribeToWebAlerts, getWebAlertQueue, getWebAlertQueue);
  const current = queue[0];
  const currentId = current?.id;

  const handleClose = useCallback(
    (button?: WebAlertButton) => {
      if (currentId === undefined) return;
      dequeueWebAlert(currentId);
      // L'action métier s'exécute après la fermeture : elle ouvre souvent une
      // nouvelle alerte, qui prend alors la place libérée au lieu de la manquer.
      button?.onPress?.();
    },
    [currentId],
  );

  if (!current) return null;

  // La clé force un remontage entre deux alertes : le focus est redéplacé dans
  // la nouvelle boîte plutôt que laissé sur un bouton disparu.
  return <WebAlertDialog key={current.id} request={current} onClose={handleClose} />;
};
