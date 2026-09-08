import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  NavigationContainer,
  useNavigationContainerRef,
  type Route,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

import { useAuth } from "../contexts/AuthContext";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import LegalNoticeScreen from "../screens/LegalNoticeScreen";
import ConsentScreen, { CONSENT_KEY } from "../screens/ConsentScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import ErrorScreen from "../screens/ErrorScreen";
import { WebShell } from "../components/webShell/WebShell";
import type { WebNavTarget } from "../components/webShell/navItems";
import type { RootStackParamList } from "../types";
import AuthStack from "./stacks/AuthStack";
import MainStack from "./stacks/MainStack";
import { RootStack } from "./rootStack";
import { linking } from "./linking";
import { buildDocumentTitle } from "./pageTitles";
import { navigateFromShell } from "./shellNavigation";

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [activeRouteName, setActiveRouteName] = useState<string | undefined>();

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((value) => {
      setConsentGiven(value !== null);
      setConsentChecked(true);
    });
  }, []);

  // La barre latérale vit hors du navigateur : elle a besoin de la route
  // focalisée pour surligner la bonne section à chaque changement d'état.
  const syncActiveRoute = useCallback(() => {
    setActiveRouteName(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  const documentTitle = useMemo(
    () => ({
      formatter: (_options: Record<string, unknown> | undefined, route?: Route<string>) =>
        buildDocumentTitle(t, route?.name),
    }),
    [t],
  );

  const handleShellNavigate = useCallback(
    (target: WebNavTarget) => navigateFromShell(navigationRef, target),
    [navigationRef],
  );

  if (loading || !consentChecked) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      documentTitle={documentTitle}
      onReady={syncActiveRoute}
      onStateChange={syncActiveRoute}
    >
      <WebShell
        activeRouteName={activeRouteName}
        authenticated={Boolean(user)}
        onNavigate={handleShellNavigate}
      >
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {consentGiven ? (
            <>
              {user ? MainStack() : AuthStack()}
            </>
          ) : (
            <RootStack.Screen
              name="Consent"
              options={{ headerShown: false }}
            >
              {() => <ConsentScreen onConsentGiven={() => setConsentGiven(true)} />}
            </RootStack.Screen>
          )}
          <RootStack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="LegalNotice" component={LegalNoticeScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="Error" component={ErrorScreen} options={{ headerShown: false }} />
        </RootStack.Navigator>
      </WebShell>
    </NavigationContainer>
  );
};

export default AppNavigator;
