// Variante web de secureStorage — API strictement identique à la version
// native (expo-secure-store), qui n'a pas d'implémentation navigateur.
//
// Modèle de sécurité retenu
// -------------------------
// Les valeurs sont chiffrées en AES-GCM 256 avant d'atterrir dans localStorage.
// La clé AES est générée une seule fois par origine, marquée NON EXTRACTIBLE
// (`extractable: false`) puis conservée dans IndexedDB sous forme de `CryptoKey` :
// le navigateur refuse alors tout `exportKey`, y compris à un script tiers.
//
// Limite réelle, à ne pas surestimer : ce chiffrement protège contre la lecture
// directe du localStorage (extension, devtools, script d'analytics qui ratisse
// le stockage, dump de profil). Il ne protège PAS contre une XSS active : un
// script injecté sur l'origine peut toujours récupérer la clé depuis IndexedDB
// et appeler `crypto.subtle.decrypt`. La vraie défense contre l'exfiltration de
// jeton reste la CSP, l'échappement des entrées et des tokens à durée courte.

// Clés stockées de façon sécurisée — miroir de la liste native
const SECURE_KEYS = ["token", "refreshToken", "user"] as const;
type SecureKey = (typeof SECURE_KEYS)[number];

const STORAGE_PREFIX = "mtc.secure.";
const DB_NAME = "mytripcircle-secure";
const DB_STORE = "crypto-keys";
const DB_VERSION = 1;
const KEY_ID = "aes-gcm-256";
const IV_BYTES = 12;

function isSecureKey(key: string): key is SecureKey {
  return (SECURE_KEYS as readonly string[]).includes(key);
}

// ─── Accès aux API navigateur (échouent explicitement si indisponibles) ───────

/** Safari en navigation privée stricte lève une SecurityError au simple accès. */
function getLocalStorage(): Storage {
  try {
    const store = globalThis.localStorage;
    if (!store) throw new Error("objet absent");
    return store;
  } catch (e) {
    throw new Error(`secureStorage: localStorage inaccessible (${String(e)})`);
  }
}

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("secureStorage: WebCrypto indisponible — HTTPS ou localhost requis");
  }
  return subtle;
}

function openKeyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const factory = globalThis.indexedDB;
    if (!factory) {
      reject(new Error("secureStorage: IndexedDB indisponible"));
      return;
    }
    const request = factory.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("secureStorage: ouverture IndexedDB refusée"));
  });
}

// ─── Clé de chiffrement ───────────────────────────────────────────────────────

function readStoredKey(db: IDBDatabase): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(KEY_ID);
    request.onsuccess = () => resolve((request.result as CryptoKey | undefined) ?? null);
    request.onerror = () =>
      reject(request.error ?? new Error("secureStorage: lecture de la clé impossible"));
  });
}

function writeStoredKey(db: IDBDatabase, key: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(key, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("secureStorage: écriture de la clé impossible"));
  });
}

async function loadOrCreateKey(): Promise<CryptoKey> {
  const subtle = getSubtle();
  const db = await openKeyDb();
  try {
    const existing = await readStoredKey(db);
    if (existing) return existing;
    // Pas de secret utilisateur disponible côté client pour dériver la clé (le
    // jeton EST le secret) : on génère un aléa 256 bits épinglé à l'origine.
    const created = await subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
      "encrypt",
      "decrypt",
    ]);
    await writeStoredKey(db, created);
    return created;
  } finally {
    db.close();
  }
}

let keyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  // On mémoïse la promesse pour éviter deux générations concurrentes au boot,
  // et on la relâche en cas d'échec pour laisser une nouvelle tentative passer.
  keyPromise ??= loadOrCreateKey().catch((e: unknown) => {
    keyPromise = null;
    throw e;
  });
  return keyPromise;
}

// ─── Encodage ─────────────────────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// Le paramètre de type explicite garantit un buffer non partagé, seul type
// accepté par `crypto.subtle` (`BufferSource`).
function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptValue(value: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await getSubtle().encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(value),
  );
  const payload = new Uint8Array(iv.length + cipher.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(cipher), iv.length);
  return toBase64(payload);
}

async function decryptValue(payload: string): Promise<string> {
  const key = await getKey();
  const bytes = fromBase64(payload);
  const plain = await getSubtle().decrypt(
    { name: "AES-GCM", iv: bytes.subarray(0, IV_BYTES) },
    key,
    bytes.subarray(IV_BYTES),
  );
  return new TextDecoder().decode(plain);
}

// ─── API publique (identique à secureStorage.ts) ──────────────────────────────

export async function setItem(key: string, value: string): Promise<void> {
  if (!isSecureKey(key)) {
    throw new Error(`secureStorage: clé non autorisée "${key}"`);
  }
  // Une écriture qui échoue doit remonter : sans elle, la session est perdue.
  getLocalStorage().setItem(STORAGE_PREFIX + key, await encryptValue(value));
}

export async function getItem(key: string): Promise<string | null> {
  if (!isSecureKey(key)) return null;
  try {
    const raw = getLocalStorage().getItem(STORAGE_PREFIX + key);
    return raw ? await decryptValue(raw) : null;
  } catch (e) {
    // Entrée illisible (clé AES purgée, stockage bloqué, données corrompues) :
    // équivalent fonctionnel à « pas de session », le boot ne doit pas planter.
    if (__DEV__) console.warn(`[secureStorage.web] Lecture impossible pour "${key}":`, e);
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  if (!isSecureKey(key)) return;
  try {
    getLocalStorage().removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    if (__DEV__) console.warn(`[secureStorage.web] Suppression impossible pour "${key}":`, e);
  }
}

export async function multiRemove(keys: string[]): Promise<void> {
  await Promise.all(keys.map((k) => removeItem(k)));
}
