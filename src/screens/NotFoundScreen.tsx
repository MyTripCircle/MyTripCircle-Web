import React from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { ErrorPageAction } from "../components/errorPages/ErrorPageAction";
import { ErrorPageLayout } from "../components/errorPages/ErrorPageLayout";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { RootStackParamList } from "../types";

const NotFoundScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  /**
   * Une 404 s'atteint par lien direct, souvent hors session : « Main » n'est
   * alors pas monté et le retour à l'accueil ne mènerait nulle part.
   */
  const goHome = () => navigation.navigate(user ? "Main" : "Welcome");

  return (
    <ErrorPageLayout
      icon="map-outline"
      iconColor={colors.textLight}
      iconBackground={colors.bgDark}
      code="404"
      title={t("notFound.title")}
      description={t("notFound.description")}
    >
      <ErrorPageAction label={t("notFound.goHome")} icon="home-outline" onPress={goHome} />
      {/* Sans historique — page ouverte directement — le retour n'a pas de cible. */}
      {navigation.canGoBack() && (
        <ErrorPageAction
          label={t("notFound.goBack")}
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      )}
    </ErrorPageLayout>
  );
};

export default NotFoundScreen;
