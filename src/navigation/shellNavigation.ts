import type { NavigationContainerRef } from "@react-navigation/native";

import type { WebNavTarget } from "../components/webShell/navItems";
import type { MainTabParamList, RootStackParamList } from "../types";

type RootNavigationRef = NavigationContainerRef<RootStackParamList>;

// Le `switch` exhaustif remplace un cast : `navigate` exige un nom de route
// littéral pour vérifier les paramètres associés.
const navigateToTab = (nav: RootNavigationRef, tab: keyof MainTabParamList): void => {
  switch (tab) {
    case "Trips":
      nav.navigate("Main", { screen: "Trips" });
      return;
    case "Bookings":
      nav.navigate("Main", { screen: "Bookings" });
      return;
    case "Ideas":
      nav.navigate("Main", { screen: "Ideas" });
      return;
    case "Addresses":
      nav.navigate("Main", { screen: "Addresses" });
      return;
    case "Profile":
      nav.navigate("Main", { screen: "Profile" });
      return;
  }
};

/** Applique une destination de la navigation latérale au stack racine. */
export const navigateFromShell = (
  nav: RootNavigationRef,
  target: WebNavTarget,
): void => {
  if (!nav.isReady()) return;

  if (target.kind === "tab") {
    navigateToTab(nav, target.tab);
    return;
  }

  switch (target.screen) {
    case "Friends":
      nav.navigate("Friends");
      return;
    case "Settings":
      nav.navigate("Settings");
      return;
  }
};
