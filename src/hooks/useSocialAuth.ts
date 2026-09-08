import { Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { parseApiError } from "../utils/i18n";
import {
  useSocialAuthBase,
  type SocialAuthMode,
  type UseSocialAuthReturn,
} from "./useSocialAuthBase";

const useSocialAuth = (mode: SocialAuthMode = "register"): UseSocialAuthReturn => {
  const { isSocialSubmitting, setIsSocialSubmitting, handleGoogleToken } = useSocialAuthBase(mode);
  const { loginWithApple } = useAuth();
  const { t } = useTranslation();

  const handleAppleSignIn = async () => {
    setIsSocialSubmitting(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const result = await loginWithApple(
          credential.identityToken,
          credential.email ?? undefined,
          credential.fullName ?? undefined,
          mode,
        );
        if (!result.success) {
          Alert.alert(
            t("common.error"),
            result.error ? parseApiError(new Error(result.error)) : t("common.unexpectedError"),
          );
        }
      }
    } catch (e: any) {
      if (e.code !== "ERR_CANCELED") {
        Alert.alert(t("common.error"), parseApiError(e) || t("common.unexpectedError"));
      }
    } finally {
      setIsSocialSubmitting(false);
    }
  };

  return { isSocialSubmitting, handleGoogleToken, handleAppleSignIn };
};

export default useSocialAuth;
