// Configuration de l'API consommée par le client web.
const PRODUCTION_API_URL = "https://mytripcircle-api.enzo-turpin.fr";

// Surcharge au build via EXPO_PUBLIC_API_URL : Expo inline les variables
// préfixées EXPO_PUBLIC_ dans le bundle. Sans elle, `npm run dev` ferait taper
// le serveur de développement local sur l'API de production.
// Exemple en local : EXPO_PUBLIC_API_URL=http://localhost:4000
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

const API_URLS = [API_BASE_URL];

export { API_URLS, API_BASE_URL };
