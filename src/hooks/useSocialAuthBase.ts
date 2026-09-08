import { useState, type Dispatch, type SetStateAction } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { parseApiError } from "../utils/i18n";

export type SocialAuthMode = "login" | "register";

/** Contrat commun aux variantes native et web de `useSocialAuth`. */
export interface UseSocialAuthReturn {
  isSocialSubmitting: boolean;
  handleGoogleToken: (accessToken: string) => Promise<void>;
  handleAppleSignIn: () => Promise<void>;
}

export interface UseSocialAuthBaseReturn {
  isSocialSubmitting: boolean;
  setIsSocialSubmitting: Dispatch<SetStateAction<boolean>>;
  handleGoogleToken: (accessToken: string) => Promise<void>;
}

/**
 * Socle partagé par les deux variantes de `useSocialAuth`.
 *
 * Google passe par `expo-auth-session`, qui fonctionne aussi bien en natif
 * qu'en navigateur : le handler d'access token est donc strictement identique.
 * Seul le parcours Apple dépend de la plateforme et reste chez l'appelant.
 */
export const useSocialAuthBase = (mode: SocialAuthMode): UseSocialAuthBaseReturn => {
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);
  const { loginWithGoogle } = useAuth();
  const { t } = useTranslation();

  const handleGoogleToken = async (accessToken: string) => {
    setIsSocialSubmitting(true);
    try {
      const result = await loginWithGoogle(accessToken, mode);
      if (!result.success) {
        Alert.alert(
          t("common.error"),
          result.error ? parseApiError(new Error(result.error)) : t("common.unexpectedError"),
        );
      }
    } catch (e) {
      if (__DEV__) console.warn("[useSocialAuth] Erreur authentification sociale:", e);
      Alert.alert(t("common.error"), t("common.unexpectedError"));
    } finally {
      setIsSocialSubmitting(false);
    }
  };

  return { isSocialSubmitting, setIsSocialSubmitting, handleGoogleToken };
};
