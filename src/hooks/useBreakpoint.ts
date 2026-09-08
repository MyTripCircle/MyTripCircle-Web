import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { BREAKPOINTS, BreakpointName, LAYOUT } from "../theme/breakpoints";

export interface BreakpointState {
  /** Largeur courante de la fenêtre, en points logiques. */
  width: number;
  /** Hauteur courante de la fenêtre, en points logiques. */
  height: number;
  /** Palier atteint par la largeur courante. */
  name: BreakpointName;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  /** Vrai dès le palier tablette — pratique pour passer une liste en grille. */
  isTabletUp: boolean;
  /** Vrai dès le palier desktop : la navigation latérale est alors montée. */
  isDesktopUp: boolean;
  /** Marge horizontale de contenu correspondant au palier courant. */
  gutter: number;
}

const resolveBreakpoint = (width: number): BreakpointName => {
  if (width >= BREAKPOINTS.wide) return "wide";
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
};

/**
 * Paliers responsive dérivés de la taille de fenêtre.
 *
 * `useWindowDimensions` est déjà réactif (redimensionnement du navigateur,
 * rotation sur mobile) : ce hook se contente de nommer les paliers pour éviter
 * que chaque composant réinvente ses propres seuils.
 */
export function useBreakpoint(): BreakpointState {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const name = resolveBreakpoint(width);
    const isDesktop = name === "desktop";
    const isWide = name === "wide";

    return {
      width,
      height,
      name,
      isMobile: name === "mobile",
      isTablet: name === "tablet",
      isDesktop,
      isWide,
      isTabletUp: name !== "mobile",
      isDesktopUp: isDesktop || isWide,
      gutter: LAYOUT.gutter[name],
    };
  }, [width, height]);
}
