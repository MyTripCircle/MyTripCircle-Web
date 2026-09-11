# MyTripCircle Web

Application web collaborative de planification de voyages entre amis. Portage navigateur de l'application mobile MyTripCircle : le code métier (écrans, contextes, services, hooks) est partagé, seules les couches dépendantes de la plateforme sont réimplémentées pour le web.

React 19 + react-native-web, bundlé par Metro via Expo. Le client ne porte aucun code serveur : il consomme l'API REST [MyTripCircle-API](https://github.com/MyTripCircle/MyTripCircle-API), dépôt séparé et source unique des données, partagée avec l'application mobile.

## Prérequis

- Node.js ≥ 20
- npm
- L'API MyTripCircle, lancée en local depuis son dépôt ou atteinte en production
- Un navigateur moderne. Le scan de billets exige `BarcodeDetector` (Chrome, Edge, Chrome Android) ; Safari bascule sur la saisie manuelle.

> La caméra (`getUserMedia`) et les notifications push (`ServiceWorker`) ne fonctionnent que sur `https://` ou `http://localhost`. Le chiffrement de session (WebCrypto) impose la même contrainte.

## Installation

```bash
git clone <url-du-dépôt>
cd MyTripCircle-Web
npm install
cp .env.example .env   # puis renseigner les valeurs
```

Lancer le serveur de développement web :

```bash
npm run dev
```

Le front est servi sur `http://localhost:8081`. Il appelle l'API désignée par `EXPO_PUBLIC_API_URL` — `http://localhost:4000` pour une API lancée en local depuis MyTripCircle-API.

## Variables d'environnement

Toutes les variables sont décrites dans `.env.example`. Préfixées `EXPO_PUBLIC_`, elles sont inlinées dans le bundle au build : aucune ne doit porter de secret.

| Variable | Rôle |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL de l'API vue par le navigateur. Absente ⇒ API de production |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_REDIRECT_URI` | Connexion Google depuis le navigateur |
| `EXPO_PUBLIC_MAP_STYLE_URL` | Style MapLibre. Absente ⇒ tuiles OpenStreetMap publiques, **réservées au développement** |

Les secrets — base, jetons, chiffrement, Stripe, notifications push, fournisseur d'itinéraires — sont ceux de l'API et se configurent dans son dépôt. En particulier, `ALLOWED_ORIGINS` et `WEB_APP_URL` y doivent désigner l'origine réelle de ce client.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` / `npm start` | Serveur de développement web |
| `npm run build` | Bundle web de production dans `dist/` |
| `npm run preview` | Sert `dist/` en local |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Suite Jest du client |
| `npm run test:coverage` | Suite Jest avec couverture |

## Adaptations web

Le portage repose sur la résolution de plateforme de Metro : un fichier `X.web.tsx` prend le pas sur `X.tsx` dans le bundle web. Les implémentations natives sont conservées, ce qui garde le dépôt capable de cibler le mobile.

| Fonctionnalité | Mobile | Web |
|---|---|---|
| Stockage de session | Keychain / Keystore (`expo-secure-store`) | `localStorage` chiffré AES-GCM, clé non extractible en IndexedDB |
| Cartographie | `react-native-maps` | MapLibre GL (façade commune `MapCanvas`) |
| Scan de billets | ML Kit (aztec, PDF417, Code 128) | `BarcodeDetector` + `getUserMedia`, repli saisie manuelle |
| Abonnement | Achats in-app App Store / Play Store | Stripe Checkout + portail de facturation |
| Notifications | `expo-notifications` | Web Push (VAPID) + service worker |
| Sélecteur de date | `@react-native-community/datetimepicker` | `<input type="date/time/datetime-local">` |
| Alertes | `Alert.alert` natif | Hôte de modale accessible (`react-native-web` livre un no-op) |
| Navigation | Deep links `mytripcircle://` | URLs réelles + historique navigateur |

Non porté : **Sign in with Apple**, qui impose un script du CDN Apple. Le bouton est masqué hors iOS.

## Navigation

Chaque écran a une URL partageable et rechargeable.

| URL | Écran | URL | Écran |
|---|---|---|---|
| `/voyages` | Liste des voyages | `/amis` | Amis |
| `/voyages/nouveau` | Création | `/amis/ajouter` | Ajouter un ami |
| `/voyages/:tripId` | Détail | `/amis/:friendId` | Profil d'un ami |
| `/voyages/:tripId/modifier` | Édition | `/profil` | Profil |
| `/voyages/:tripId/membres` | Membres | `/profil/modifier` | Édition du profil |
| `/voyages/:tripId/apercu` | Vue publique | `/abonnement` | Abonnement |
| `/reservations` | Réservations | `/reglages` | Réglages |
| `/reservations/:bookingId` | Détail | `/reglages/mot-de-passe` | Mot de passe |
| `/adresses` | Adresses | `/reglages/consentements` | Consentements |
| `/idees` | Idées & itinéraires | `/notifications` | Notifications |
| `/carte` | Carte plein écran | `/aide` | Aide |

Les liens diffusés par e-mail sont inchangés et restent compatibles avec l'application mobile : `/invitation/:token`, `/friend-invite/:token`, `/reset-password`.

Au-delà de 1024 px, une barre latérale persistante remplace la barre d'onglets flottante ; en dessous, l'expérience mobile est conservée à l'identique.

## Structure

```
MyTripCircle-Web/
├── public/                  # Template HTML, manifeste PWA, service worker
├── src/
│   ├── components/
│   │   ├── map/             # Façade cartographique (natif + MapLibre)
│   │   ├── ui/              # Champs partagés (DateTimeField…)
│   │   ├── webAlert/        # Hôte de modale remplaçant Alert.alert
│   │   └── webShell/        # Barre latérale et colonne de contenu desktop
│   ├── screens/             # 41 écrans
│   ├── contexts/            # Auth, Trips, Friends, Theme, Notifications…
│   ├── hooks/               # Hooks métier + variantes .web.ts
│   ├── navigation/          # Navigateurs, config linking, titres de page
│   ├── services/api/        # Client HTTP par domaine
│   ├── theme/               # Couleurs, typographie, points de rupture
│   └── utils/               # i18n, helpers, stockage sécurisé
├── tests/load/              # Scénarios k6 contre l'API
└── docs/adr/                # Décisions d'architecture
```

## Sécurité

Côté client :

- Session conservée dans un `localStorage` chiffré en AES-GCM, clé non extractible en IndexedDB
- Jeton d'accès envoyé en en-tête `Authorization`
- Aucune donnée personnelle ni jeton dans les journaux

Côté API, dont le client dépend :

- Cookies `httpOnly` acceptés en complément, avec protection CSRF en double-submit appliquée uniquement quand la requête s'appuie sur le cookie (l'app mobile en Bearer n'est pas impactée)
- Redirections OAuth validées contre une allowlist d'origines exactes
- Webhook Stripe vérifié par signature sur le corps brut
- Helmet, HSTS, CSP à nonce sur les pages HTML servies par l'API

## Déploiement

`npm run build` produit un site statique dans `dist/`, à servir derrière n'importe quel hébergeur statique en mode SPA (toutes les routes réécrites vers `index.html`).

Points de vigilance :

- Renseigner `ALLOWED_ORIGINS` et `WEB_APP_URL` de l'API avec l'origine réelle du front
- Le webhook Stripe doit pointer sur `POST /subscriptions/webhook` de l'API
- Les cookies utilisent `sameSite: lax` : front et API doivent partager le même domaine enregistrable, sinon rester en authentification Bearer
- Remplacer les tuiles OpenStreetMap publiques par un fournisseur de tuiles via `EXPO_PUBLIC_MAP_STYLE_URL`

## Licence

MIT
