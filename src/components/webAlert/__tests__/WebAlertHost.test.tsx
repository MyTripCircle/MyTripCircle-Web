import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Ionicons } from "@expo/vector-icons";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "../../../utils/i18n/index";
import { enqueueWebAlert, resetWebAlertQueue } from "../alertQueue";
import { installWebAlert } from "../installWebAlert";
import { AlertActionButton } from "../WebAlertActions";
import { WebAlertHost } from "../WebAlertHost";

// `@expo/vector-icons` charge sa police depuis le registre d'assets d'Expo,
// absent de l'environnement Jest : on lui substitue un rendu texte inerte.
jest.mock("@expo/vector-icons", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => createElement(Text, null, name),
  };
});

// L'initialisation réelle (`src/utils/i18n`) tire toute la couche API : on ne
// recharge ici que les ressources de traduction, seule chose qu'affiche la boîte.
beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    resources,
    lng: "fr",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    keySeparator: ".",
    nsSeparator: false,
  });
});

beforeEach(() => {
  resetWebAlertQueue();
});

// ── Utilitaires de requête ───────────────────────────────────────────────────
// Sous `jest-expo/web`, react-native-web produit des éléments DOM (`div`,
// `button`) que les requêtes sémantiques de RNTL, taillées pour les composants
// natifs (`Text`, `View`), ne reconnaissent pas. On interroge donc l'arbre rendu.

/** `react-test-renderer` ne publie pas ses types : forme minimale d'un nœud rendu. */
interface RenderedNode {
  type: unknown;
  props: Record<string, unknown>;
  children: Array<RenderedNode | string>;
  findAll(predicate: (node: RenderedNode) => boolean): RenderedNode[];
  findAllByType(type: unknown): RenderedNode[];
}

const root = (): RenderedNode => screen.UNSAFE_root;

const instanceText = (node: RenderedNode | string): string =>
  typeof node === "string" ? node : node.children.map(instanceText).join(" ");

const hostsWithRole = (role: string): RenderedNode[] =>
  root().findAll((node: RenderedNode) => typeof node.type === "string" && node.props.role === role);

const queryDialog = (): RenderedNode | undefined => hostsWithRole("dialog")[0];

const visibleText = (): string => instanceText(root());

/** Traitement visuel appliqué à chaque bouton, dans l'ordre de la rangée. */
const buttonVariants = (): unknown[] =>
  root()
    .findAllByType(AlertActionButton)
    .map((node) => node.props.variant);

// react-native-web branche `onPress` sur le `click` DOM et lit ces trois membres
// avant de relayer l'appui.
const CLICK_EVENT = { altKey: false, stopPropagation: () => {}, preventDefault: () => {} };

const pressButton = (label: string): void => {
  const target = hostsWithRole("button").find((node) => instanceText(node).includes(label));
  if (!target) throw new Error(`Bouton « ${label} » absent de la boîte de dialogue`);
  fireEvent(target, "click", CLICK_EVENT);
};

/** `Alert.alert` est impératif : la mise à jour de la file sort du rendu React. */
const openAlert = (...args: Parameters<typeof enqueueWebAlert>) => {
  act(() => enqueueWebAlert(...args));
};

const pressEscape = () => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });
};

describe("WebAlertHost", () => {
  it("should render nothing when the queue is empty", () => {
    render(<WebAlertHost />);

    expect(queryDialog()).toBeUndefined();
  });

  it("should display the title and the message of the pending alert", () => {
    render(<WebAlertHost />);

    openAlert("Suppression", "Cette action est définitive");

    expect(visibleText()).toContain("Suppression");
    expect(visibleText()).toContain("Cette action est définitive");
  });

  it("should expose the dialog as an accessible modal labelled by its title", () => {
    render(<WebAlertHost />);

    openAlert("Suppression");

    const dialog = queryDialog();
    const titleId = String(dialog?.props["aria-labelledby"]);
    const titleNodes = root().findAll(
      (node: RenderedNode) => typeof node.type === "string" && String(node.props.id) === titleId,
    );

    expect(dialog?.props["aria-modal"]).toBe(true);
    expect(instanceText(titleNodes[0])).toContain("Suppression");
  });

  it("should fall back to a single OK button when no button is provided", () => {
    render(<WebAlertHost />);

    openAlert("Titre");

    expect(hostsWithRole("button")).toHaveLength(1);
    expect(visibleText()).toContain("OK");
  });
});

describe("WebAlertHost — styles de bouton", () => {
  it("should render a default button with the primary treatment", () => {
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [{ text: "Valider" }]);

    expect(buttonVariants()).toEqual(["default"]);
  });

  it("should give the primary treatment to the fallback OK button", () => {
    render(<WebAlertHost />);

    openAlert("Titre");

    expect(buttonVariants()).toEqual(["default"]);
  });

  it("should render cancel and destructive buttons with their own treatment", () => {
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive" },
    ]);

    expect(buttonVariants()).toEqual(["cancel", "destructive"]);
  });

  it("should back the destructive treatment with a non-colour cue", () => {
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive" },
    ]);

    // Le rouge ne doit pas être le seul porteur de l'information (WCAG 1.4.1).
    expect(root().findAllByType(Ionicons)).toHaveLength(1);
  });
});

describe("WebAlertHost — fermeture", () => {
  it("should run the onPress of the pressed button", () => {
    const onPress = jest.fn();
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress },
    ]);
    pressButton("Supprimer");

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should not run the onPress of the other buttons", () => {
    const onCancel = jest.fn();
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [
      { text: "Annuler", style: "cancel", onPress: onCancel },
      { text: "Supprimer", style: "destructive" },
    ]);
    pressButton("Supprimer");

    expect(onCancel).not.toHaveBeenCalled();
  });

  it("should close the dialog once a button has been pressed", () => {
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [{ text: "Fermer" }]);
    pressButton("Fermer");

    expect(queryDialog()).toBeUndefined();
  });

  it("should close on Escape when a cancel button exists", () => {
    const onCancel = jest.fn();
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [
      { text: "Annuler", style: "cancel", onPress: onCancel },
      { text: "Valider" },
    ]);
    pressEscape();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(queryDialog()).toBeUndefined();
  });

  it("should stay open on Escape when no cancel button exists", () => {
    render(<WebAlertHost />);

    openAlert("Titre", undefined, [{ text: "Valider" }]);
    pressEscape();

    expect(queryDialog()).toBeDefined();
  });
});

describe("WebAlertHost — file d'attente", () => {
  it("should display the queued alerts one after the other", () => {
    render(<WebAlertHost />);

    openAlert("Première", undefined, [{ text: "Suivant" }]);
    openAlert("Seconde", undefined, [{ text: "Suivant" }]);

    expect(visibleText()).toContain("Première");
    expect(visibleText()).not.toContain("Seconde");

    pressButton("Suivant");

    expect(visibleText()).toContain("Seconde");
  });

  it("should display an alert opened from the onPress of the previous one", () => {
    render(<WebAlertHost />);

    openAlert("Première", undefined, [
      { text: "Suivant", onPress: () => enqueueWebAlert("Enchaînée") },
    ]);
    pressButton("Suivant");

    expect(visibleText()).toContain("Enchaînée");
  });
});

describe("installWebAlert", () => {
  it("should route Alert.alert to the host on web", () => {
    installWebAlert();
    render(<WebAlertHost />);

    act(() => {
      Alert.alert("Erreur", "Connexion impossible", [{ text: "OK" }]);
    });

    expect(visibleText()).toContain("Erreur");
    expect(visibleText()).toContain("Connexion impossible");
  });
});
