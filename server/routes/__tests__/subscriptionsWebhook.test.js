const request = require("supertest");
const express = require("express");

// La configuration Stripe est figée au require de config : elle doit précéder
// le chargement du routeur. Clés factices — aucun appel réseau n'est effectué.
const WEBHOOK_SECRET = "whsec_secret_de_test";
process.env.STRIPE_SECRET_KEY = "sk_test_factice";
process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.STRIPE_PRICE_MONTHLY = "price_mensuel_test";
process.env.WEB_APP_URL = "https://app.test.local";

const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();
jest.mock("../../db", () => ({
  getDb: () => ({ collection: () => ({ findOne: mockFindOne, updateOne: mockUpdateOne }) }),
}));

const Stripe = require("stripe");
const subscriptionsRouter = require("../subscriptions");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function buildApp() {
  const app = express();
  // Reproduit le montage réel : corps brut sur le webhook, JSON ailleurs.
  app.use("/subscriptions/webhook", express.raw({ type: "application/json" }));
  app.use(express.json());
  app.use("/subscriptions", subscriptionsRouter);
  return app;
}

function signedRequest(app, event) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
  return request(app)
    .post("/subscriptions/webhook")
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);
}

describe("POST /subscriptions/webhook — vérification de signature Stripe", () => {
  let app;
  let warnSpy;

  beforeAll(() => {
    app = buildApp();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => warnSpy.mockRestore());

  beforeEach(() => {
    mockFindOne.mockReset();
    mockUpdateOne.mockReset();
  });

  it("should reject the event when the stripe-signature header is missing", async () => {
    // Act
    const res = await request(app)
      .post("/subscriptions/webhook")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ type: "invoice.paid" }));

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Signature manquante");
  });

  it("should reject the event when the signature does not match the webhook secret", async () => {
    // Arrange
    const payload = JSON.stringify({ type: "invoice.paid", data: { object: {} } });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: "whsec_mauvais_secret",
    });

    // Act
    const res = await request(app)
      .post("/subscriptions/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(payload);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Signature invalide");
  });

  it("should reject the event when the payload was altered after signing", async () => {
    // Arrange : signature calculée sur un corps, puis corps modifié
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify({ type: "invoice.paid", data: { object: {} } }),
      secret: WEBHOOK_SECRET,
    });

    // Act
    const res = await request(app)
      .post("/subscriptions/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(JSON.stringify({ type: "customer.subscription.deleted", data: { object: {} } }));

    // Assert
    expect(res.status).toBe(400);
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  it("should acknowledge an unhandled event type when the signature is valid", async () => {
    // Act
    const res = await signedRequest(app, { type: "invoice.paid", data: { object: {} } });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  it("should expire the local subscription when a subscription deleted event is received", async () => {
    // Arrange
    mockFindOne.mockResolvedValue({ _id: "abc", stripeSubscriptionId: "sub_123", endDate: null });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    // Act
    const res = await signedRequest(app, {
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_123", status: "canceled", current_period_end: 1800000000 } },
    });

    // Assert
    expect(res.status).toBe(200);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: "abc" },
      expect.objectContaining({ $set: expect.objectContaining({ status: "expired" }) })
    );
  });

  it("should ignore a subscription event when no local subscription matches", async () => {
    // Arrange
    mockFindOne.mockResolvedValue(null);

    // Act
    const res = await signedRequest(app, {
      type: "customer.subscription.updated",
      data: { object: { id: "sub_inconnu", status: "active" } },
    });

    // Assert
    expect(res.status).toBe(200);
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });
});
