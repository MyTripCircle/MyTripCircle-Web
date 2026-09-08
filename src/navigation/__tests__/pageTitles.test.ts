import i18next, { type i18n as I18nInstance } from "i18next";

import { resources } from "../../utils/i18n/index";
import { buildDocumentTitle } from "../pageTitles";

const createInstance = async (lng: "fr" | "en"): Promise<I18nInstance> => {
  const instance = i18next.createInstance();
  await instance.init({
    resources,
    lng,
    fallbackLng: "en",
    keySeparator: ".",
    nsSeparator: false,
  });
  return instance;
};

describe("buildDocumentTitle", () => {
  it("should suffix the translated screen title with the app name in French", async () => {
    const instance = await createInstance("fr");

    const title = buildDocumentTitle(instance.t, "TripDetails");

    expect(title).toBe("Détails du voyage · MyTripCircle");
  });

  it("should translate the screen title according to the active language", async () => {
    const instance = await createInstance("en");

    const title = buildDocumentTitle(instance.t, "Settings");

    expect(title).toBe("Settings · MyTripCircle");
  });

  it("should resolve a title for every tab route", async () => {
    const instance = await createInstance("fr");

    const titles = ["Trips", "Bookings", "Ideas", "Addresses", "Profile"].map((name) =>
      buildDocumentTitle(instance.t, name),
    );

    titles.forEach((title) => expect(title).not.toContain("pageTitle."));
  });

  it("should fall back to the app name when the route is unknown", async () => {
    const instance = await createInstance("fr");

    expect(buildDocumentTitle(instance.t, "InexistantScreen")).toBe("MyTripCircle");
    expect(buildDocumentTitle(instance.t, undefined)).toBe("MyTripCircle");
  });
});
