import React from "react";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { ErrorPageAction } from "../components/errorPages/ErrorPageAction";
import { ErrorPageLayout } from "../components/errorPages/ErrorPageLayout";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { RootStackParamList } from "../types";

interface ErrorScreenParams {
  message?: string;
  canGoBack?: boolean;
}

const ErrorScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const params = (route.params ?? {}) as ErrorScreenParams;
  const { message, canGoBack = true } = params;

  /**
   * Hors session, « Main » n'est pas monté : l'accueil est alors l'écran de
   * bienvenue. Une page d'erreur web doit toujours offrir une porte de sortie.
   */
  const goHome = () => navigation.navigate(user ? "Main" : "Welcome");

  return (
    <ErrorPageLayout
      icon="alert-circle-outline"
      iconColor={colors.danger}
      iconBackground={colors.dangerLight}
      title={t("errorScreen.title")}
      description={message ?? t("errorScreen.defaultMessage")}
    >
      <ErrorPageAction label={t("errorScreen.goHome")} icon="home-outline" onPress={goHome} />
      {canGoBack && navigation.canGoBack() && (
        <ErrorPageAction
          label={t("errorScreen.goBack")}
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      )}
    </ErrorPageLayout>
  );
};

export default ErrorScreen;
