// Runtime web d'Expo : Fast Refresh, gestion de l'historique et des erreurs dans
// le navigateur. Doit être importé avant tout le reste.
import '@expo/metro-runtime';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent appelle AppRegistry.registerComponent('main', () => App)
// puis monte l'app sur le <div id="root"> du template public/index.html.
registerRootComponent(App);
