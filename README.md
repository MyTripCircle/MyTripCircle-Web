# MyTripCircle Web

Application web collaborative de planification de voyages entre amis. Portage navigateur de l'application mobile MyTripCircle : le code métier (écrans, contextes, services, hooks) est partagé, seules les couches dépendantes de la plateforme sont réimplémentées pour le web.

Front : React 19 + react-native-web, bundlé par Metro via Expo. Back : Express 5 / MongoDB.

## Prérequis

- Node.js ≥ 20
- npm
- Une instance MongoDB (locale ou Atlas)
- Un navigateur moderne. Le scan de billets exige `BarcodeDetector` (Chrome, Edge, Chrome Android) ; Safari bascule sur la saisie manuelle.

> La caméra (`getUserMedia`) et les notifications push (`ServiceWorker`) ne fonctionnent que sur `https://` ou `http://localhost`. Le chiffrement de session (WebCrypto) impose la même contrainte.

## Installation

```bash
git clone <url-du-dépôt>
cd MyTripCircle-Web
npm install
cp .env.example .env   # puis renseigner les valeurs
```

Lancer le backend et le front en parallèle :

```bash
npm run dev
```

Le front est servi sur `http://localhost:8081`, l'API sur `http://localhost:4000`.

## Variables d'environnement

Toutes les variables sont décrites dans `.env.example`. Les indispensables :

| Variable | Rôle |
|---|---|
| `MONGODB_URI`, `DB_NAME` | Connexion à la base |
| `JWT_SECRET`, `REFRESH_SECRET` | Signature des jetons |
| `ENCRYPTION_KEY`, `HMAC_KEY` | Chiffrement des données personnelles (64 caractères hexadécimaux) |
| `ALLOWED_ORIGINS` | Origines autorisées en CORS. **Vide en production = arrêt au démarrage** |
| `WEB_APP_URL` | Origine du front, utilisée pour les redirections OAuth et Stripe |
| `EXPO_PUBLIC_API_URL` | URL de l'API vue par le navigateur, inlinée au build |

Optionnelles, en dégradé propre si absentes :

| Variable | Absente ⇒ |
|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` | Les routes de paiement web répondent 503 |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Notifications push web désactivées |
| `EXPO_PUBLIC_MAP_STYLE_URL` | Repli sur les tuiles OpenStreetMap publiques, **réservées au développement** |
| `GROQ_API_KEY` | Génération d'itinéraires IA indisponible |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Backend + serveur de développement web en parallèle |
| `npm start` | Serveur de développement web seul |
| `npm run server` | Backend Express seul |
| `npm run build` | Bundle web de production dans `dist/` |
| `npm run preview` | Sert `dist/` en local |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Suite Jest (client + serveur) |
| `npm run test:coverage` | Suite Jest avec couverture |
| `npm run seed` | Alimente la base avec des données de test |

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
│   ├── screens/             # 42 écrans
│   ├── contexts/            # Auth, Trips, Friends, Theme, Notifications…
│   ├── hooks/               # Hooks métier + variantes .web.ts
│   ├── navigation/          # Navigateurs, config linking, titres de page
│   ├── services/api/        # Client HTTP par domaine
│   ├── theme/               # Couleurs, typographie, points de rupture
│   └── utils/               # i18n, helpers, stockage sécurisé
├── server/
│   ├── middleware/          # Auth, CSRF, CSP, limitation de débit, audit
│   ├── routes/              # auth, trips, bookings, subscriptions, push…
│   ├── services/            # Stripe, IAP, push, métier
│   └── utils/               # Cookies, redirections, e-mail, chiffrement
└── docs/adr/                # Décisions d'architecture
```

## Sécurité

- Authentification par JWT en en-tête `Authorization`, avec support additionnel de cookies `httpOnly` côté serveur
- Protection CSRF en double-submit, appliquée uniquement quand la requête s'appuie sur le cookie (l'app mobile en Bearer n'est pas impactée)
- Redirections OAuth validées contre une allowlist d'origines exactes
- Webhook Stripe vérifié par signature sur le corps brut
- Helmet, HSTS, CSP à nonce sur les pages HTML servies par l'API
- Aucune donnée personnelle ni jeton dans les journaux

## Déploiement

`npm run build` produit un site statique dans `dist/`, à servir derrière n'importe quel hébergeur statique en mode SPA (toutes les routes réécrites vers `index.html`).

Points de vigilance :

- Renseigner `ALLOWED_ORIGINS` et `WEB_APP_URL` avec l'origine réelle du front
- Le webhook Stripe doit pointer sur `POST /subscriptions/webhook`
- Les cookies utilisent `sameSite: lax` : front et API doivent partager le même domaine enregistrable, sinon rester en authentification Bearer
- Remplacer les tuiles OpenStreetMap publiques par un fournisseur de tuiles via `EXPO_PUBLIC_MAP_STYLE_URL`

## Licence

MIT
