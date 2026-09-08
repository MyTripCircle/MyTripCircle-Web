import React from "react";
import { Text } from "react-native";
import { act, render, screen } from "@testing-library/react-native";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "../../../utils/i18n/index";
import { AuthSplitLayout } from "../AuthSplitLayout";

// `@expo/vector-icons` charge sa police depuis le registre d'assets d'Expo,
// absent de l'environnement Jest : on lui substitue un rendu texte inerte.
jest.mock("@expo/vector-icons", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  const { Text: RNText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => createElement(RNText, null, name),
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

/**
 * react-native-web mesure `document.documentElement.clientWidth` : jsdom ne
 * calculant aucune mise en page, on force la valeur avant l'événement resize.
 */
const resizeWindowTo = (width: number) => {
  act(() => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: width,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 900,
      configurable: true,
    });
    window.dispatchEvent(new Event("resize"));
  });
};

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

const hostsWithRole = (role: string): RenderedNode[] =>
  root().findAll(
    (node: RenderedNode) => typeof node.type === "string" && node.props.role === role,
  );

const FORM_MARKER = "Formulaire de connexion";

const renderLayout = () =>
  render(
    <AuthSplitLayout>
      <Text>{FORM_MARKER}</Text>
    </AuthSplitLayout>,
  );

describe("AuthSplitLayout", () => {
  it("should render the form alone when the window is narrower than the desktop breakpoint", () => {
    resizeWindowTo(390);

    renderLayout();

    expect(instanceText(root())).toContain(FORM_MARKER);
    expect(hostsWithRole("complementary")).toHaveLength(0);
  });

  it("should keep the form full width on tablet, where the split would squeeze it", () => {
    resizeWindowTo(900);

    renderLayout();

    expect(hostsWithRole("complementary")).toHaveLength(0);
  });

  it("should add the argument panel beside the form from the desktop breakpoint", () => {
    resizeWindowTo(1280);

    renderLayout();

    expect(instanceText(root())).toContain(FORM_MARKER);
    expect(hostsWithRole("complementary")).toHaveLength(1);
  });

  it("should describe the product in the panel rather than leave it decorative", () => {
    resizeWindowTo(1280);

    renderLayout();

    expect(instanceText(root())).toContain(i18n.t("auth.aside.title"));
    expect(instanceText(root())).toContain(i18n.t("auth.aside.bullet1"));
  });
});
