import React, { useCallback } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { RootStackParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import {
  LandingFeatures,
  LandingFinalCta,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingSteps,
} from "../components/landing";

type WelcomeNavProp = StackNavigationProp<RootStackParamList, "Welcome">;

/**
 * Page d'accueil publique, servie sur `/bienvenue`.
 *
 * C'est la seule page vue par un visiteur non connecté : elle est composée
 * comme un site web et non comme un écran d'application — marque, proposition
 * de valeur, fonctionnalités livrées, déroulé d'un voyage, rappel de l'appel à
 * l'action, informations légales. Chaque section gère sa propre largeur de
 * contenu et son propre fond ; l'écran ne fait que les assembler.
 */
export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavProp>();
  const { colors } = useTheme();

  const goToRegister = useCallback(
    () => navigation.navigate("Auth", { initialMode: "register" }),
    [navigation],
  );
  const goToLogin = useCallback(
    () => navigation.navigate("Auth", { initialMode: "login" }),
    [navigation],
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.bg }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LandingHeader onSignIn={goToLogin} onStart={goToRegister} />

        {/* Le contenu éditorial est regroupé : un lecteur d'écran peut ainsi
            sauter directement du bandeau de marque au corps de la page. */}
        <View role="main">
          <LandingHero onStart={goToRegister} onSignIn={goToLogin} />
          <LandingFeatures />
          <LandingSteps />
          <LandingFinalCta onStart={goToRegister} onSignIn={goToLogin} />
        </View>

        <LandingFooter
          onNavigateTerms={() => navigation.navigate("Terms")}
          onNavigatePrivacy={() => navigation.navigate("Privacy")}
          onNavigateLegalNotice={() => navigation.navigate("LegalNotice")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
