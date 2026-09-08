import AsyncStorage from "@react-native-async-storage/async-storage";
import { request, type HttpMethod } from "../services/api/apiCore";
import logger from "../utils/logger";

const PUSH_ENDPOINT_KEY = "@mytripcircle_push_endpoint_v1";
const SERVICE_WORKER_URL = "/sw.js";

const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

/** La clé VAPID transite en base64url ; PushManager attend des octets bruts. */
const urlBase64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
};

/**
 * `request()` parse systématiquement la réponse en JSON : sur un 204 sans corps,
 * ce parsing échoue alors que le serveur a bien traité l'appel.
 */
async function requestNoContent(path: string, method: HttpMethod, body?: unknown): Promise<void> {
  try {
    await request<void>(path, method, body);
  } catch (error) {
    if (error instanceof SyntaxError) return;
    throw error;
  }
}

async function ensureRegistration(): Promise<ServiceWorkerRegistration | null> {
  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_URL);
  } catch (error) {
    logger.warn("[usePushNotifications.web] service worker non enregistré", error);
    return null;
  }
}

/**
 * La permission n'est demandée que dans la foulée d'une action utilisateur :
 * un prompt déclenché au chargement de la page est pénalisé par les navigateurs
 * (Chrome le passe en UI silencieuse, Safari le refuse) et dégrade l'expérience.
 */
async function resolvePermission(): Promise<NotificationPermission> {
  if (Notification.permission !== "default") return Notification.permission;
  if (navigator.userActivation?.isActive !== true) return "default";
  return Notification.requestPermission();
}

async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const { publicKey } = await request<{ publicKey: string }>("/users/push/vapid-public-key");
  if (!publicKey) return null;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function requestPermissionAndRegisterToken(): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await ensureRegistration();
  if (!registration) return;

  const permission = await resolvePermission();
  if (permission !== "granted") return;

  try {
    const subscription = await subscribeToPush(registration);
    if (!subscription) return;

    // Évite un aller-retour serveur à chaque démarrage tant que l'endpoint est stable.
    const stored = await AsyncStorage.getItem(PUSH_ENDPOINT_KEY);
    if (stored === subscription.endpoint) return;

    await requestNoContent("/users/push/subscribe", "POST", { subscription: subscription.toJSON() });
    await AsyncStorage.setItem(PUSH_ENDPOINT_KEY, subscription.endpoint);
  } catch (error) {
    logger.warn("[usePushNotifications.web] abonnement push impossible", error);
  }
}

export async function clearStoredPushToken(): Promise<void> {
  const endpoint = await AsyncStorage.getItem(PUSH_ENDPOINT_KEY);
  await AsyncStorage.removeItem(PUSH_ENDPOINT_KEY);
  if (!isPushSupported() || !endpoint) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
    await requestNoContent("/users/push/subscribe", "DELETE", { endpoint });
  } catch (error) {
    logger.warn("[usePushNotifications.web] désabonnement push impossible", error);
  }
}
