import fs from "node:fs";
import path from "node:path";

import { resources } from "../index";

const SRC_ROOT = path.resolve(__dirname, "../../..");

// Les clés construites dynamiquement (`t(\`trips.status.${x}\`)`) ne sont pas
// vérifiables statiquement : on ne retient que les littéraux simples.
const T_CALL = /\bt\(\s*["']([A-Za-z0-9_][A-Za-z0-9_.]*)["']/g;

// Les fichiers de traduction eux-mêmes contiennent des libellés, pas des appels.
const IGNORED_DIRS = new Set(["__tests__", "i18n"]);

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) collectSourceFiles(full, acc);
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function collectUsedKeys(): Map<string, string> {
  // clé → premier fichier qui l'utilise, pour un message d'échec exploitable
  const keys = new Map<string, string>();
  for (const file of collectSourceFiles(SRC_ROOT)) {
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(T_CALL)) {
      const key = match[1];
      if (!keys.has(key)) keys.set(key, path.relative(SRC_ROOT, file));
    }
  }
  return keys;
}

function resolve(bundle: Record<string, unknown>, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      bundle,
    );
}

// i18next résout `x.count` vers `x.count_one` / `x.count_other` selon la valeur
// passée : une clé plurielle est donc valide si l'une des formes existe.
const PLURAL_SUFFIXES = ["_one", "_other", "_zero", "_many"];

// Une traduction est soit une chaîne, soit un tableau de chaînes récupéré avec
// `returnObjects: true` (listes d'étapes de l'export calendrier, par exemple).
function isTranslation(value: unknown): boolean {
  if (typeof value === "string") return true;
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function existsIn(bundle: Record<string, unknown>, key: string): boolean {
  if (isTranslation(resolve(bundle, key))) return true;
  return PLURAL_SUFFIXES.some((suffix) => isTranslation(resolve(bundle, key + suffix)));
}

describe("clés de traduction", () => {
  const used = collectUsedKeys();

  it("should find translation calls to check", () => {
    // Garde-fou : si la collecte casse, le test ne doit pas passer à vide.
    expect(used.size).toBeGreaterThan(100);
  });

  it.each(["fr", "en"] as const)(
    "should define every used key in %s",
    (locale) => {
      const bundle = resources[locale].translation as Record<string, unknown>;

      const missing = [...used.entries()]
        .filter(([key]) => !existsIn(bundle, key))
        .map(([key, file]) => `${key}  (${file})`);

      expect(missing).toEqual([]);
    },
  );

  it("should keep fr and en in sync for every used key", () => {
    const fr = resources.fr.translation as Record<string, unknown>;
    const en = resources.en.translation as Record<string, unknown>;

    const desynced = [...used.keys()].filter(
      (key) => existsIn(fr, key) !== existsIn(en, key),
    );

    expect(desynced).toEqual([]);
  });
});
