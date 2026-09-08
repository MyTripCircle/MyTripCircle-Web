import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BootSplash } from "./src/components/webShell/BootSplash";
import { getInitialSafeAreaMetrics } from "./src/components/webShell/safeAreaMetrics";
import { WebAlertHost, installWebAlert } from "./src/components/webAlert";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { FriendsProvider } from "./src/contexts/FriendsContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { SubscriptionProvider } from "./src/contexts/SubscriptionContext";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { initLanguage } from "./src/utils/i18n";
import { useFonts, Sora_300Light, Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora";

// Mesuré une seule fois : le provider ne lit ces métriques qu'au premier rendu.
const INITIAL_SAFE_AREA_METRICS = getInitialSafeAreaMetrics();

// Posé au chargement du module et non dans un effet : un écran peut alerter dès
// son premier rendu, avant que le moindre effet ne se déclenche.
installWebAlert();

export default function App() {
  useEffect(() => {
    initLanguage();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  useEffect(() => {
    // Un CDN de polices injoignable ne doit pas rester silencieux : l'app démarre
    // quand même, avec les polices de repli du navigateur.
    if (fontError && __DEV__) {
      console.warn("[App] Chargement des polices Google impossible :", fontError);
    }
  }, [fontError]);

  // On patiente le temps du chargement, mais jamais indéfiniment : en cas
  // d'échec l'application se rend avec les polices système.
  if (!fontsLoaded && !fontError) {
    return <BootSplash />;
  }

  return (
    <SafeAreaProvider initialMetrics={INITIAL_SAFE_AREA_METRICS}>
      <NetworkProvider>
      <ThemeProvider>
        <AuthProvider>
          <TripsProvider>
            <NotificationProvider>
              <FriendsProvider>
                <SubscriptionProvider>
                  <AppNavigator />
                </SubscriptionProvider>
              </FriendsProvider>
            </NotificationProvider>
          </TripsProvider>
        </AuthProvider>
        {/* Hors du navigateur et rendu en dernier : la boîte recouvre le shell
            web, dont la colonne de contenu rogne ce qui déborde. */}
        <WebAlertHost />
      </ThemeProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
