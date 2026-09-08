// ── Paliers responsive ──────────────────────────────────────────────────────
// Bornes basses (min-width) de chaque palier, exprimées en points logiques.
// Sur mobile natif seul le palier « mobile » est atteint : ces valeurs pilotent
// avant tout le shell web.
export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type BreakpointName = "mobile" | "tablet" | "desktop" | "wide";

// ── Gabarit du shell web ────────────────────────────────────────────────────
export const LAYOUT = {
  /**
   * Un site web n'a pas une largeur de contenu unique : une grille de cartes
   * gagne à s'étaler, alors qu'un formulaire ou un texte long devient illisible
   * au-delà d'une certaine mesure de ligne. Chaque écran choisit sa variante.
   */
  maxWidth: {
    /** Listes et grilles : occupe l'espace disponible. */
    wide: 1440,
    /** Écrans de détail, gabarits deux colonnes. */
    default: 1200,
    /** Formulaires et textes légaux : ~90 caractères par ligne au maximum. */
    narrow: 760,
  },
  /** Largeur de la navigation latérale persistante (à partir du palier desktop). */
  sidebarWidth: 248,
  /** Marge horizontale du contenu, croissante avec la largeur de fenêtre. */
  gutter: {
    mobile: 16,
    tablet: 24,
    desktop: 32,
    wide: 40,
  },
} as const;

export type ContentWidth = keyof typeof LAYOUT.maxWidth;
