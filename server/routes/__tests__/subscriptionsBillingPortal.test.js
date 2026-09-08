const request = require("supertest");
const express = require("express");

const USER_ID = "507f1f77bcf86cd799439011";

const mockFindOne = jest.fn();

// Le routeur lit la configuration Stripe au chargement du module : on recharge
// pour couvrir aussi bien « Stripe configuré » que le dégradé « non configuré ».
function buildApp({ stripeEnabled }) {
  jest.resetModules();

  if (stripeEnabled) {
    process.env.STRIPE_SECRET_KEY = "sk_test_factice";
    process.env.WEB_APP_URL = "https://app.test.local";
  } else {
    delete process.env.STRIPE_SECRET_KEY;
  }

  jest.doMock("../../db", () => ({
    getDb: () => ({ collection: () => ({ findOne: mockFindOne }) }),
  }));
  jest.doMock("../../middleware/auth", () => ({
    requireAuth: (req, _res, next) => {
      req.user = { _id: USER_ID };
      next();
    },
  }));

  const app = express();
  app.use(express.json());
  app.use("/subscriptions", require("../subscriptions"));
  return app;
}

describe("POST /subscriptions/billing-portal", () => {
  let errorSpy;

  beforeEach(() => {
    mockFindOne.mockReset();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => errorSpy.mockRestore());

  it("should return 503 when Stripe is not configured", async () => {
    // Arrange
    const app = buildApp({ stripeEnabled: false });

    // Act
    const res = await request(app).post("/subscriptions/billing-portal");

    // Assert
    expect(res.status).toBe(503);
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it("should return 404 when the subscription has no Stripe customer", async () => {
    // Arrange — abonnement souscrit via un store mobile : pas de client Stripe
    const app = buildApp({ stripeEnabled: true });
    mockFindOne.mockResolvedValue({ userId: USER_ID, platform: "ios", status: "active" });

    // Act
    const res = await request(app).post("/subscriptions/billing-portal");

    // Assert
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 when the user has no subscription at all", async () => {
    // Arrange
    const app = buildApp({ stripeEnabled: true });
    mockFindOne.mockResolvedValue(null);

    // Act
    const res = await request(app).post("/subscriptions/billing-portal");

    // Assert
    expect(res.status).toBe(404);
  });

  it("should never expose the Stripe customer id to the client", async () => {
    // Arrange
    const app = buildApp({ stripeEnabled: true });
    mockFindOne.mockResolvedValue({ userId: USER_ID, platform: "ios", status: "active" });

    // Act
    const res = await request(app).post("/subscriptions/billing-portal");

    // Assert
    expect(JSON.stringify(res.body)).not.toContain("cus_");
  });
});
