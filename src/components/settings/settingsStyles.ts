import { StyleSheet } from "react-native";

import { F, FONT_SIZE, RADIUS, SPACING } from "../../theme";

/**
 * Marge horizontale d'origine des blocs de réglages. Conservée sous le palier
 * desktop, où l'écran ne passe pas par `PageContainer`.
 */
export const SETTINGS_GUTTER = 18;

/**
 * Styles partagés par les blocs de réglages (carte, ligne, libellé de groupe).
 *
 * Centraliser ces valeurs évite que la version mobile et le panneau desktop
 * divergent : les deux rendent exactement les mêmes lignes, seule la mise en
 * page qui les entoure change.
 */
export const settingsStyles = StyleSheet.create({
  sectionLabel: {
    fontFamily: F.sans600,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 1.4,
    marginHorizontal: SETTINGS_GUTTER,
    marginBottom: 6,
    marginTop: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: SETTINGS_GUTTER,
  },
  /** Dans une colonne de contenu, la marge vient déjà du conteneur de page. */
  cardFluid: {
    marginHorizontal: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  /** Densité réduite sur grand écran : plus de lignes visibles sans défilement. */
  rowDense: {
    paddingVertical: SPACING.sm + 2,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowEmoji: {
    fontSize: 26,
  },
  rowTitle: {
    fontFamily: F.sans500,
    fontSize: 19,
  },
  rowTitleDense: {
    fontSize: FONT_SIZE.xl,
  },
  rowValue: {
    fontFamily: F.sans400,
    fontSize: FONT_SIZE.xl,
  },
  /**
   * Repère de focus clavier posé en absolu : visible sans jamais décaler la
   * ligne, contrairement à une bordure qui rognerait les marges internes.
   */
  focusMarker: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  clickable: {
    cursor: "pointer",
  },
});
