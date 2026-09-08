import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "../../../utils/i18n/index";
import { LANDING_FEATURES, LANDING_STEPS } from "../landingContent";
import { LandingFeatures } from "../LandingFeatures";
import { LandingFooter } from "../LandingFooter";
import { LandingHero } from "../LandingHero";
import { LandingSteps } from "../LandingSteps";

// `@expo/vector-icons` charge sa police depuis le registre d'assets d'Expo,
// absent de l'environnement Jest : on lui substitue un rendu texte inerte.
jest.mock("@expo/vector-icons", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => createElement(Text, null, name),
  };
});

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

/** `react-test-renderer` ne publie pas ses types : forme minimale d'un nœud rendu. */
interface RenderedNode {
  type: unknown;
  props: Record<string, unknown>;
  children: Array<RenderedNode | string>;
  findAll(predicate: (node: RenderedNode) => boolean): RenderedNode[];
}

const root = (): RenderedNode => screen.UNSAFE_root;

const instanceText = (node: RenderedNode | string): string =>
  typeof node === "string" ? node : node.children.map(instanceText).join(" ");

const visibleText = (): string => instanceText(root());

const headingsAtLevel = (level: number): RenderedNode[] =>
  root().findAll(
    (node: RenderedNode) =>
      typeof node.type === "string" && node.props["aria-level"] === level,
  );

const hostsWithRole = (role: string): RenderedNode[] =>
  root().findAll(
    (node: RenderedNode) => typeof node.type === "string" && node.props.role === role,
  );

// react-native-web branche `onPress` sur le `click` DOM et lit ces trois membres
// avant de relayer l'appui.
const CLICK_EVENT = { altKey: false, stopPropagation: () => {}, preventDefault: () => {} };

const pressLink = (label: string): void => {
  const target = hostsWithRole("link").find((node) => instanceText(node).includes(label));
  if (!target) throw new Error(`Lien « ${label} » absent du pied de page`);
  fireEvent(target, "click", CLICK_EVENT);
};

const noop = () => {};

describe("section « fonctionnalités »", () => {
  it("should present every shipped capability", () => {
    render(<LandingFeatures />);

    const rendered = visibleText();
    LANDING_FEATURES.forEach((entry) => {
      expect(rendered).toContain(i18n.t(entry.titleKey));
    });
  });

  it("should title the section at level 2 and each card at level 3", () => {
    render(<LandingFeatures />);

    expect(headingsAtLevel(2)).toHaveLength(1);
    expect(headingsAtLevel(3)).toHaveLength(LANDING_FEATURES.length);
  });
});

describe("section « comment ça marche »", () => {
  it("should number every step in words rather than by position alone", () => {
    render(<LandingSteps />);

    const rendered = visibleText();
    LANDING_STEPS.forEach((entry, index) => {
      expect(rendered).toContain(i18n.t("welcome.steps.stepLabel", { number: index + 1 }));
      expect(rendered).toContain(i18n.t(entry.titleKey));
    });
  });
});

describe("héros de la page d'accueil", () => {
  it("should carry the single level 1 heading of the page", () => {
    render(<LandingHero onStart={noop} onSignIn={noop} />);

    expect(headingsAtLevel(1)).toHaveLength(1);
    expect(visibleText()).toContain(i18n.t("welcome.hero.title"));
  });
});

describe("pied de page public", () => {
  it("should expose the three legal pages as links", () => {
    render(
      <LandingFooter
        onNavigateTerms={noop}
        onNavigatePrivacy={noop}
        onNavigateLegalNotice={noop}
      />,
    );

    expect(hostsWithRole("link")).toHaveLength(3);
  });

  it("should navigate to the legal notice when its link is activated", () => {
    const onNavigateLegalNotice = jest.fn();
    render(
      <LandingFooter
        onNavigateTerms={noop}
        onNavigatePrivacy={noop}
        onNavigateLegalNotice={onNavigateLegalNotice}
      />,
    );

    pressLink(i18n.t("welcome.footer.legal"));

    expect(onNavigateLegalNotice).toHaveBeenCalledTimes(1);
  });
});
