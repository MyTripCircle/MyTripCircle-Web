import { getPathFromState, getStateFromPath } from "@react-navigation/native";
import type { NavigationState, PartialState } from "@react-navigation/native";

import { linking } from "../linking";

type AnyState = PartialState<NavigationState>;

const config = linking.config;

/** Route réellement affichée, une fois les navigateurs imbriqués traversés. */
const focusedRoute = (path: string) => {
  const state = getStateFromPath(path, config) as AnyState | undefined;
  if (!state) return undefined;

  let current: AnyState | undefined = state;
  let route = current.routes[current.routes.length - 1];

  while (route?.state) {
    current = route.state as AnyState;
    route = current.routes[current.routes.length - 1];
  }
  return route;
};

describe("linking config", () => {
  it("should resolve the trips tab when the path is /voyages", () => {
    const route = focusedRoute("/voyages");

    expect(route?.name).toBe("Trips");
  });

  it("should extract the trip id when the path targets a trip", () => {
    const route = focusedRoute("/voyages/abc123");

    expect(route?.name).toBe("TripDetails");
    expect(route?.params).toEqual({ tripId: "abc123" });
  });

  it("should prefer the static segment over the trip id param", () => {
    const route = focusedRoute("/voyages/nouveau");

    expect(route?.name).toBe("CreateTrip");
  });

  it("should parse boolean query params as real booleans", () => {
    const route = focusedRoute("/reservations/bk-1?readOnly=true");

    expect(route?.name).toBe("BookingDetails");
    expect(route?.params).toEqual({ bookingId: "bk-1", readOnly: true });
  });

  it("should parse the trip actions counters as numbers", () => {
    const route = focusedRoute("/voyages/t-1/actions?totalBookings=3&isOwner=false");

    expect(route?.params).toMatchObject({
      tripId: "t-1",
      totalBookings: 3,
      isOwner: false,
    });
  });

  it("should keep the trip invitation path already sent by e-mail", () => {
    const route = focusedRoute("/invitation/token-42");

    expect(route?.name).toBe("Invitation");
    expect(route?.params).toEqual({ token: "token-42" });
  });

  it("should keep the friend invitation path already sent by e-mail", () => {
    const route = focusedRoute("/friend-invite/token-42");

    expect(route?.name).toBe("FriendInvitation");
    expect(route?.params).toEqual({ token: "token-42" });
  });

  it("should keep the password reset path already sent by e-mail", () => {
    const route = focusedRoute("/reset-password?code=abc");

    expect(route?.name).toBe("ForgotPassword");
    expect(route?.params).toEqual({ code: "abc" });
  });

  it("should fall back to the not found screen for an unknown path", () => {
    const route = focusedRoute("/chemin-inexistant");

    expect(route?.name).toBe("NotFound");
  });

  it("should leave the root path to the default initial route", () => {
    expect(getStateFromPath("/", config)).toBeUndefined();
  });

  it("should stack a deep linked screen above the tabs so going back works", () => {
    const state = getStateFromPath("/reglages", config) as AnyState;

    expect(state.routes.map((route) => route.name)).toEqual(["Main", "Settings"]);
  });

  it("should rebuild the same url from a state with typed params", () => {
    const path = "/voyages/t-1/actions?totalBookings=3&isOwner=false";
    const state = getStateFromPath(path, config) as AnyState;

    expect(getPathFromState(state, config)).toContain("/voyages/t-1/actions");
    expect(getPathFromState(state, config)).toContain("isOwner=false");
  });
});
