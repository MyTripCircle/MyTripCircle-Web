// Deux projets Jest : le client web (preset jest-expo/web) et le backend
// Node/Express (environnement node). Lancer les deux avec `npm test`.
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
    {
      displayName: "server",
      testEnvironment: "node",
      testMatch: ["<rootDir>/server/**/*.test.js"],
      setupFiles: ["<rootDir>/server/__tests__/setupEnv.js"],
      modulePathIgnorePatterns: ["<rootDir>/.claude/"],
    },
  ],
  // Périmètre de couverture restreint à la couche réellement testable unitairement
  // (logique métier client + backend). Écrans, composants UI, contextes,
  // navigation et fichiers de données/traductions sont validés autrement
  // (tests d'intégration, recette manuelle, TestFlight) et hors périmètre ici.
  collectCoverageFrom: [
    "src/services/**/*.ts",
    "src/utils/**/*.ts",
    "src/hooks/**/*.{ts,tsx}",
    "src/components/**/*Helpers.ts",
    "server/**/*.js",
    "!**/__tests__/**",
    "!**/*.d.ts",
    "!src/services/api/index.ts",
    "!src/utils/i18n/**",
    "!server/index.js",
    "!server/db.js",
  ],
};
