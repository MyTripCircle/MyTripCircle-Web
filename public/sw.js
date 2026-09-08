/* eslint-env serviceworker */
/**
 * Service worker Web Push de MyTripCircle.
 * Chargé depuis la racine du build (les fichiers de `public/` y sont copiés)
 * pour couvrir toute l'application avec le scope "/".
 */

const DEFAULT_TITLE = "MyTripCircle";
const NOTIFICATION_ICON = "/assets/icon.png";

/** Le serveur envoie du JSON ; on tolère un corps texte ou vide sans planter. */
function readPayload(data) {
  if (!data) return { title: DEFAULT_TITLE };
  try {
    return data.json();
  } catch (error) {
    console.warn("[sw] charge utile push non JSON", error);
    return { title: DEFAULT_TITLE, body: data.text() };
  }
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event.data);
  const options = {
    body: payload.body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: payload.tag,
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(payload.title || DEFAULT_TITLE, options));
});

/** Réutilise un onglet déjà ouvert plutôt que d'en empiler un nouveau. */
async function focusOrOpen(targetUrl) {
  const url = new URL(targetUrl, self.location.origin);
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

  for (const client of clients) {
    if (new URL(client.url).origin !== url.origin) continue;
    if (client.url !== url.href && "navigate" in client) {
      await client.navigate(url.href);
    }
    return client.focus();
  }

  return self.clients.openWindow(url.href);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(focusOrOpen(event.notification.data?.url || "/"));
});
