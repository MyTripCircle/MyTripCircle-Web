import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider, type Metrics } from "react-native-safe-area-context";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "../../utils/i18n/index";
import WelcomeScreen from "../WelcomeScreen";

// Métriques figées : le test ne doit pas dépendre de la fenêtre de l'exécutant.
const SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 1280, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

jest.mock("@expo/vector-icons", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return { Ionicons: ({ name }: { name: string }) => createElement(Text, null, name) };
});

// Le préfixe `mock` est imposé par Jest : une fabrique de mock ne peut pas
// référencer de variable hors de sa portée, sauf nommée ainsi.
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

/** Concatène le texte de l'arbre rendu — RNTL ne matche pas les nœuds DOM de RNW. */
function flattenText(node: unknown): string {
  if (typeof node === "string") return node;
  const children = (node as { children?: unknown[] })?.children ?? [];
  return children.map(flattenText).join(" ");
}

/** `react-test-renderer` ne publie pas ses types : forme minimale d'un nœud rendu. */
interface RenderedNode {
  type: unknown;
  props: Record<string, unknown>;
  findAll(predicate: (node: RenderedNode) => boolean): RenderedNode[];
}

const root = (): RenderedNode => screen.UNSAFE_root as unknown as RenderedNode;

const hostsWithRole = (role: string): RenderedNode[] =>
  root().findAll(
    (node: RenderedNode) => typeof node.type === "string" && node.props.role === role,
  );

// react-native-web branche `onPress` sur le `click` DOM et lit ces trois membres
// avant de relayer l'appui.
const CLICK_EVENT = { altKey: false, stopPropagation: () => {}, preventDefault: () => {} };

/**
 * Active le premier élément interactif portant ce libellé. Plusieurs sections
 * répètent volontairement le même appel à l'action : le premier rencontré est
 * celui que le visiteur voit en premier.
 */
const press = (role: "button" | "link", label: string): void => {
  const target = hostsWithRole(role).find((node) => flattenText(node).includes(label));
  if (!target) throw new Error(`Élément « ${label} » (${role}) absent de la page`);
  fireEvent(target, "click", CLICK_EVENT);
};

const renderLanding = () =>
  render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <WelcomeScreen />
    </SafeAreaProvider>,
  );

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
  mockNavigate.mockClear();
});

describe("WelcomeScreen", () => {
  // Page d'accueil publique : c'est le point d'entrée des visiteurs non
  // connectés, il ne doit jamais planter au rendu.
  it("should render every landing section when mounted", () => {
    renderLanding();

    const rendered = flattenText(screen.UNSAFE_root);

    expect(rendered).toContain(i18n.t("welcome.hero.title"));
    expect(rendered).toContain(i18n.t("welcome.features.title"));
    expect(rendered).toContain(i18n.t("welcome.steps.title"));
    expect(rendered).toContain(i18n.t("welcome.finalCta.title"));
    expect(rendered).toContain(i18n.t("welcome.footer.legalHeading"));
  });

  it("should expose a single level 1 heading for the whole page", () => {
    renderLanding();

    const titles = root().findAll(
      (node) => typeof node.type === "string" && node.props["aria-level"] === 1,
    );

    expect(titles).toHaveLength(1);
  });

  it("should open the registration form when the main call to action is activated", () => {
    renderLanding();

    press("button", i18n.t("welcome.ctaStart"));

    expect(mockNavigate).toHaveBeenCalledWith("Auth", { initialMode: "register" });
  });

  it("should open the sign-in form when the header link is activated", () => {
    renderLanding();

    press("link", i18n.t("welcome.nav.signIn"));

    expect(mockNavigate).toHaveBeenCalledWith("Auth", { initialMode: "login" });
  });

  it("should open the legal notice when its footer link is activated", () => {
    renderLanding();

    press("link", i18n.t("welcome.footer.legal"));

    expect(mockNavigate).toHaveBeenCalledWith("LegalNotice");
  });

  it("should open the terms of use when its footer link is activated", () => {
    renderLanding();

    press("link", i18n.t("welcome.footer.terms"));

    expect(mockNavigate).toHaveBeenCalledWith("Terms");
  });
});
