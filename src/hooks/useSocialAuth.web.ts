import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import {
  useSocialAuthBase,
  type SocialAuthMode,
  type UseSocialAuthReturn,
} from "./useSocialAuthBase";

/**
 * Variante web de useSocialAuth — même contrat de retour que la version native.
 *
 * Google : rien de spécifique à faire. `expo-auth-session` supporte le web et
 * réalise déjà une redirection OAuth navigateur classique (voir AuthScreen) ;
 * l'access token retombe sur le même handler que sur mobile.
 *
 * Apple : `expo-apple-authentication` est natif-only. Le portage passerait par
 * « Sign in with Apple JS », qui impose de charger un script depuis le CDN
 * d'Apple — dépendance tierce non versionnée et élargissement de la CSP. Le
 * parcours est donc explicitement désactivé plutôt qu'à moitié implémenté.
 * `SocialAuthButtons` ne rend pas le bouton Apple hors iOS : ce handler sert de
 * garde-fou si un autre écran venait à l'appeler.
 */
const useSocialAuth = (mode: SocialAuthMode = "register"): UseSocialAuthReturn => {
  const { isSocialSubmitting, handleGoogleToken } = useSocialAuthBase(mode);
  const { t } = useTranslation();

  const handleAppleSignIn = async () => {
    Alert.alert(t("common.info"), t("auth.appleUnavailableWeb"));
  };

  return { isSocialSubmitting, handleGoogleToken, handleAppleSignIn };
};

export default useSocialAuth;
