import { useEffect } from "react";
import { Platform } from "react-native";

// Sélecteur volontairement large : react-native-web pose `tabindex="0"` sur les
// `Pressable` porteurs de `role="button"`, mais la boîte peut aussi contenir un
// jour des champs natifs.
const FOCUSABLE_SELECTOR = [
  '[tabindex]:not([tabindex="-1"])',
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
].join(", ");

const canUseDom = (): boolean => Platform.OS === "web" && typeof document !== "undefined";

const focusablesIn = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

const trapTab = (root: HTMLElement, event: KeyboardEvent): void => {
  const targets = focusablesIn(root);
  if (targets.length === 0) return;
  const first = targets[0];
  const last = targets[targets.length - 1];
  const active = document.activeElement;
  const outside = !root.contains(active);

  if (event.shiftKey && (outside || active === first)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (outside || active === last)) {
    event.preventDefault();
    first.focus();
  }
};

/**
 * Rend une boîte de dialogue conforme WCAG 2.1 AA au clavier : focus déplacé à
 * l'intérieur à l'ouverture, piégé tant qu'elle est ouverte, puis restitué à
 * l'élément déclencheur à la fermeture.
 *
 * Le nœud est retrouvé par `id` plutôt que par `ref` : `react-native-web` expose
 * bien l'élément DOM, mais le typage RN d'une `ref` de `View` ne le décrit pas.
 */
export const useDialogFocus = (dialogId: string): void => {
  useEffect(() => {
    if (!canUseDom()) return;

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.getElementById(dialogId);
    // `root` est absent en environnement de test (react-test-renderer ne produit
    // aucun DOM) : le piège à focus se met alors simplement en sommeil.
    if (root) (focusablesIn(root)[0] ?? root).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const current = document.getElementById(dialogId);
      if (current) trapTab(current, event);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [dialogId]);
};
