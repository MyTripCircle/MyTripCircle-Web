const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

// Doit être préfixé `mock*` pour être référençable dans la factory de jest.mock (hoistée).
const mockFindOne = jest.fn();
jest.mock("../../db", () => ({
  getDb: () => ({ collection: () => ({ findOne: mockFindOne }) }),
}));

const { requireAuth } = require("../auth");
const { ACCESS_COOKIE } = require("../../utils/authCookies");
const { JWT_SECRET } = require("../../config");

const VALID_USER_ID = "507f1f77bcf86cd799439011";

function buildApp() {
  const app = express();
  app.use(cookieParser());
  app.get("/protected", requireAuth, (req, res) => res.json({ ok: true, user: req.user }));
  return app;
}

function tokenFor(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
}

describe("requireAuth — lecture du token depuis le cookie", () => {
  let app;
  let warnSpy;

  beforeAll(() => {
    app = buildApp();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => warnSpy.mockRestore());
  beforeEach(() => mockFindOne.mockReset());

  it("should authenticate when the token is only provided as an httpOnly cookie", async () => {
    // Arrange
    mockFindOne.mockResolvedValue({ _id: new ObjectId(VALID_USER_ID), name: "Alice" });

    // Act
    const res = await request(app)
      .get("/protected")
      .set("Cookie", [`${ACCESS_COOKIE}=${tokenFor(VALID_USER_ID)}`]);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Alice");
  });

  it("should keep the Authorization header priority when both header and cookie are present", async () => {
    // Arrange : cookie invalide, en-tête valide — l'en-tête doit l'emporter
    mockFindOne.mockResolvedValue({ _id: new ObjectId(VALID_USER_ID), name: "Alice" });

    // Act
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${tokenFor(VALID_USER_ID)}`)
      .set("Cookie", [`${ACCESS_COOKIE}=pas-un-jwt`]);

    // Assert
    expect(res.status).toBe(200);
  });

  it("should reject when the header is invalid even if the cookie holds a valid token", async () => {
    // Arrange
    mockFindOne.mockResolvedValue({ _id: new ObjectId(VALID_USER_ID), name: "Alice" });

    // Act
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer pas-un-jwt")
      .set("Cookie", [`${ACCESS_COOKIE}=${tokenFor(VALID_USER_ID)}`]);

    // Assert
    expect(res.status).toBe(401);
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it("should return 401 when the cookie token is invalid", async () => {
    // Act
    const res = await request(app)
      .get("/protected")
      .set("Cookie", [`${ACCESS_COOKIE}=pas-un-jwt`]);

    // Assert
    expect(res.status).toBe(401);
    expect(mockFindOne).not.toHaveBeenCalled();
  });
});
