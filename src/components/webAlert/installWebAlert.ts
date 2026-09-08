import { Alert, Platform } from "react-native";

import { enqueueWebAlert } from "./alertQueue";

let installed = false;

/**
 * Redirige `Alert.alert` vers l'hôte de modale React (`WebAlertHost`).
 *
 * `react-native-web` livre un `Alert` inerte (`class Alert { static alert() {} }`) :
 * sans cette substitution, les quelque 180 alertes, confirmations et messages
 * d'erreur du projet seraient totalement muets dans le navigateur.
 *
 * On remplace la méthode statique plutôt que les sites d'appel : ceux-ci
 * importent tous `Alert` depuis `react-native` et restent donc inchangés, y
 * compris dans le code partagé avec le natif.
 */
export const installWebAlert = (): void => {
  // Le natif dispose d'un vrai dialogue système : on n'y touche pas.
  if (Platform.OS !== "web" || installed) return;
  installed = true;

  Alert.alert = (title, message, buttons) => {
    enqueueWebAlert(title, message, buttons);
  };
};
