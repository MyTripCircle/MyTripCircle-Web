import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";

import { SPACING } from "../../theme";

/** Marge laissée au-dessus d'une section une fois le défilement terminé. */
const ANCHOR_MARGIN = SPACING.xxl;
/**
 * Une section est considérée courante dès que son titre franchit cette bande
 * haute : sans elle, le surlignage ne changerait qu'une fois la section sortie
 * de l'écran par le haut.
 */
const ACTIVE_THRESHOLD = 120;

/**
 * Sommaire ancré d'une page légale.
 *
 * React Native n'a pas d'ancres HTML : on mémorise la position de chaque
 * section, mesurée à la mise en page, et on pilote le `ScrollView` à la main.
 * Les positions sont relatives à la colonne de texte, elle-même décalée dans le
 * contenu défilant — d'où le décalage de base mesuré séparément.
 */
export function useLegalToc() {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<number[]>([]);
  const baseY = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const registerSection = useCallback((index: number, y: number) => {
    offsets.current[index] = y;
  }, []);

  const handleBodyLayout = useCallback((event: LayoutChangeEvent) => {
    baseY.current = event.nativeEvent.layout.y;
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const offset = offsets.current[index];
    if (offset === undefined) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, baseY.current + offset - ANCHOR_MARGIN),
      animated: true,
    });
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const limit = event.nativeEvent.contentOffset.y + ACTIVE_THRESHOLD;
    let next = 0;
    offsets.current.forEach((offset, index) => {
      if (baseY.current + offset <= limit) next = index;
    });
    setActiveIndex((current) => (current === next ? current : next));
  }, []);

  return { scrollRef, activeIndex, registerSection, handleBodyLayout, scrollToSection, handleScroll };
}
