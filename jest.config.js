// Projet Jest unique : le client web (preset jest-expo/web). Le code serveur
// vit dans le dépôt MyTripCircle-API, avec sa propre suite.
// Le preset `web` résout les variantes `.web.ts(x)` et alias react-native vers
// react-native-web : les tests exercent donc bien le code réellement livré.
module.exports = {
  projects: [
    {
      displayName: "client",
      preset: "jest-expo/web",
      testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
      modulePathIgnorePatterns: ["<rootDir>/.claude/", "<rootDir>/dist/"],
    },
  ],
  // Périmètre de couverture restreint à la couche réellement testable unitairement
  // (logique métier du client). Écrans, composants UI, contextes,
  // navigation et fichiers de données/traductions sont validés autrement
  // (tests d'intégration, recette manuelle, TestFlight) et hors périmètre ici.
  collectCoverageFrom: [
    "src/services/**/*.ts",
    "src/utils/**/*.ts",
    "src/hooks/**/*.{ts,tsx}",
    "src/components/**/*Helpers.ts",
    "!**/__tests__/**",
    "!**/*.d.ts",
    "!src/services/api/index.ts",
    "!src/utils/i18n/**",
  ],
};
