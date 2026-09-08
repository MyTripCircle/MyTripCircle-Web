/**
 * File d'attente des alertes web.
 *
 * `Alert.alert` est une API impérative appelable de n'importe où (hooks,
 * services, gestionnaires d'évènements) alors que l'affichage, lui, vit dans
 * l'arbre React. Ce module fait le pont entre les deux mondes : il conserve les
 * demandes en FIFO, ce qui évite qu'une seconde alerte écrase la première comme
 * le ferait un simple `useState` partagé.
 */

export type WebAlertButtonStyle = "default" | "cancel" | "destructive";

export interface WebAlertButton {
  text?: string;
  onPress?: () => void;
  style?: WebAlertButtonStyle;
}

export interface WebAlertRequest {
  /** Identifiant croissant : clé de rendu stable et unique côté hôte. */
  id: number;
  title: string;
  message?: string;
  /** Vide quand l'appelant n'a fourni aucun bouton (cas du simple « OK »). */
  buttons: readonly WebAlertButton[];
}

type QueueListener = () => void;

// `queue` n'est jamais muté en place : `useSyncExternalStore` compare les
// références pour décider de re-rendre.
let queue: readonly WebAlertRequest[] = [];
let nextId = 1;
const listeners = new Set<QueueListener>();

const notify = (): void => {
  listeners.forEach((listener) => listener());
};

export const getWebAlertQueue = (): readonly WebAlertRequest[] => queue;

export const subscribeToWebAlerts = (listener: QueueListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const enqueueWebAlert = (
  title: string,
  message?: string,
  buttons?: readonly WebAlertButton[],
): void => {
  queue = [...queue, { id: nextId++, title, message, buttons: buttons ?? [] }];
  notify();
};

/** Retire l'alerte affichée : la suivante de la file prend aussitôt sa place. */
export const dequeueWebAlert = (id: number): void => {
  const remaining = queue.filter((request) => request.id !== id);
  // Un double appel (clic sur un bouton pendant la fermeture) ne doit pas
  // consommer l'alerte suivante par erreur.
  if (remaining.length === queue.length) return;
  queue = remaining;
  notify();
};

/** Remet la file à zéro entre deux cas de test. */
export const resetWebAlertQueue = (): void => {
  queue = [];
  notify();
};
