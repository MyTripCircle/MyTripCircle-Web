import React from "react";
import { StyleSheet, View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useTheme } from "../../contexts/ThemeContext";
import { Sidebar } from "./Sidebar";
import { findActiveNavKey, WebNavTarget } from "./navItems";

interface WebShellProps {
  children: React.ReactNode;
  /** Nom react-navigation de la route affichée. */
  activeRouteName?: string;
  /** La navigation latérale n'a de sens qu'une fois la session ouverte. */
  authenticated: boolean;
  onNavigate: (target: WebNavTarget) => void;
}

/**
 * Enveloppe applicative web : navigation latérale persistante au-delà du palier
 * desktop, et surface de contenu pleine largeur.
 *
 * Le shell n'impose volontairement aucune largeur maximale : c'est chaque écran
 * qui choisit la sienne via `PageContainer`, une grille de cartes n'ayant pas la
 * même mesure idéale qu'un formulaire. Contraindre ici ramènerait tout le monde
 * à une colonne unique — précisément ce qui trahit une application mobile
 * transposée.
 *
 * Les insets de safe area valent 0 sur navigateur de bureau : rien n'est ajouté
 * ici, sous peine de marges fantômes en haut du contenu.
 */
export const WebShell: React.FC<WebShellProps> = ({
  children,
  activeRouteName,
  authenticated,
  onNavigate,
}) => {
  const { colors } = useTheme();
  const { isDesktopUp } = useBreakpoint();

  const activeKey = findActiveNavKey(activeRouteName);
  // Hors application (authentification, invitation, erreur), aucune entrée ne
  // correspond : on rend les écrans nus pour préserver leur mise en page.
  const showSidebar = authenticated && isDesktopUp && activeKey !== undefined;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {showSidebar && <Sidebar activeKey={activeKey} onNavigate={onNavigate} />}
      <View
        style={[
          styles.content,
          showSidebar && {
            borderLeftWidth: StyleSheet.hairlineWidth,
            borderColor: colors.borderLight,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
