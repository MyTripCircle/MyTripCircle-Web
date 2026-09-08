import { act, renderHook } from "@testing-library/react-native";

import { useBreakpoint } from "../useBreakpoint";

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

describe("useBreakpoint", () => {
  it("should report the mobile breakpoint when the window is narrow", () => {
    const { result } = renderHook(() => useBreakpoint());

    resizeWindowTo(390);

    expect(result.current.name).toBe("mobile");
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTabletUp).toBe(false);
  });

  it("should report the tablet breakpoint between 768 and 1024", () => {
    const { result } = renderHook(() => useBreakpoint());

    resizeWindowTo(900);

    expect(result.current.name).toBe("tablet");
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTabletUp).toBe(true);
  });

  it("should report the desktop breakpoint from 1024", () => {
    const { result } = renderHook(() => useBreakpoint());

    resizeWindowTo(1024);

    expect(result.current.name).toBe("desktop");
    expect(result.current.isDesktop).toBe(true);
  });
});
