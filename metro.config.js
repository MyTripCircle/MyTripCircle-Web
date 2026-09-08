const { getDefaultConfig } = require("expo/metro-config");

// isCSSEnabled autorise les `import "…​.css"` dans le bundle web : indispensable
// pour les feuilles de style des libs DOM (MapLibre GL notamment), qui n'ont pas
// d'équivalent StyleSheet côté react-native-web.
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

module.exports = config;
