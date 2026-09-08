const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

// L'envoi d'OTP par email est une dépendance externe (SMTP) : on la mocke pour
// garder les tests déterministes et hors-réseau (cf. CLAUDE.md).
jest.mock("../utils/email");

// Identifiants de test conformes à isStrongPassword (maj, min, chiffre, spécial).
const TEST_USER = {
  name: "Integration Test",
  email: "integration@test.local",
  password: "IntegTest!42",
};

// Origine web autorisée : lue par config au require, donc posée avant.
const WEB_ORIGIN = "http://localhost:8081";

let mongod;
let app;
let connectMongo;
let closeMongo;
let getDb;

beforeAll(async () => {
  // 1) Démarre un MongoDB éphémère en mémoire et expose son URI AVANT de
  //    charger db/config (qui lisent MONGODB_URI au moment du require).
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.ALLOWED_ORIGINS = WEB_ORIGIN;

  // 2) config.js fige MONGODB_URI au require ; on vide le cache de modules APRÈS
  //    avoir fixé l'URI pour que db/config se rechargent sur la base en mémoire.
  jest.resetModules();

  // 3) Require après le reset pour que la couche DB pointe sur la base en mémoire.
  ({ connectMongo, closeMongo, getDb } = require("../db"));
  app = require("../app");

  // 3) Connecte (crée aussi les index, dont l'unicité sur emailHash).
  await connectMongo();
}, 60000);

afterEach(async () => {
  // Isolation : chaque test repart d'une collection users vide.
  await getDb().collection("users").deleteMany({});
});

afterAll(async () => {
  await closeMongo();
  if (mongod) await mongod.stop();
});

// Inscrit l'utilisateur de test via l'API. Renvoie la réponse supertest.
function register(overrides = {}) {
  return request(app)
    .post("/users/register")
    .send({ ...TEST_USER, ...overrides });
}

// Marque un utilisateur comme vérifié directement en base (simule la saisie OTP).
async function markVerified(email) {
  const { hashField } = require("../utils/crypto");
  await getDb()
    .collection("users")
    .updateOne({ emailHash: hashField(email.toLowerCase()) }, { $set: { verified: true } });
}

// Ne conserve que les paires nom=valeur des Set-Cookie, comme le ferait un navigateur.
function cookieHeader(res) {
  return (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
}

async function registerAndLogin() {
  await register();
  await markVerified(TEST_USER.email);
  return request(app)
    .post("/users/login")
    .send({ email: TEST_USER.email, password: TEST_USER.password });
}

describe("Intégration auth — register/login avec MongoDB", () => {
  it("should persist an unverified user when registration succeeds", async () => {
    // Act
    const res = await register();

    // Assert
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const { hashField } = require("../utils/crypto");
    const stored = await getDb()
      .collection("users")
      .findOne({ emailHash: hashField(TEST_USER.email) });
    expect(stored).not.toBeNull();
    expect(stored.verified).toBe(false);
    expect(stored.email).not.toBe(TEST_USER.email); // email chiffré en base
  });

  it("should reject login when the account is not yet verified", async () => {
    // Arrange
    await register();

    // Act
    const res = await request(app)
      .post("/users/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    // Assert
    expect(res.status).toBe(403);
    expect(res.body.requiresOtp).toBe(true);
  });

  it("should return a token when logging in with a verified account", async () => {
    // Arrange
    await register();
    await markVerified(TEST_USER.email);

    // Act
    const res = await request(app)
      .post("/users/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  it("should reject login with a wrong password", async () => {
    // Arrange
    await register();
    await markVerified(TEST_USER.email);

    // Act
    const res = await request(app)
      .post("/users/login")
      .send({ email: TEST_USER.email, password: "MauvaisMdp!1" });

    // Assert
    expect(res.status).toBe(401);
  });

  it("should reject a duplicate registration of a verified email", async () => {
    // Arrange
    await register();
    await markVerified(TEST_USER.email);

    // Act
    const res = await register();

    // Assert
    expect(res.status).toBe(409);
  });

  it("should set httpOnly session cookies and return a CSRF token when logging in", async () => {
    // Act
    const res = await registerAndLogin();

    // Assert
    const cookies = res.headers["set-cookie"] || [];
    const accessCookie = cookies.find((c) => c.startsWith("mtc_access="));
    expect(accessCookie).toContain("HttpOnly");
    expect(accessCookie).toContain("SameSite=Lax");
    expect(cookies.find((c) => c.startsWith("mtc_refresh="))).toContain("Path=/users/refresh");
    expect(typeof res.body.csrfToken).toBe("string");
  });

  it("should authorize a protected route with the session cookie alone", async () => {
    // Arrange
    const login = await registerAndLogin();

    // Act : aucun en-tête Authorization, seulement les cookies du navigateur
    const res = await request(app).get("/subscriptions/me").set("Cookie", cookieHeader(login));

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.plan).toBe("free");
  });

  it("should reject a cookie-authenticated mutation when the CSRF token is missing", async () => {
    // Arrange
    const login = await registerAndLogin();

    // Act
    const res = await request(app)
      .post("/users/logout")
      .set("Cookie", cookieHeader(login))
      .set("Origin", WEB_ORIGIN)
      .send({});

    // Assert
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Jeton CSRF invalide");
  });

  it("should clear the session cookies when logging out with a valid CSRF token", async () => {
    // Arrange
    const login = await registerAndLogin();

    // Act
    const res = await request(app)
      .post("/users/logout")
      .set("Cookie", cookieHeader(login))
      .set("Origin", WEB_ORIGIN)
      .set("X-CSRF-Token", login.body.csrfToken)
      .send({});

    // Assert
    expect(res.status).toBe(200);
    const cleared = res.headers["set-cookie"] || [];
    expect(cleared.find((c) => c.startsWith("mtc_access="))).toContain("Expires=Thu, 01 Jan 1970");
    // Sans refresh token dans le corps (cookie limité à /users/refresh), toutes
    // les sessions de l'utilisateur doivent être révoquées côté serveur.
    const remaining = await getDb()
      .collection("refreshTokens")
      .countDocuments({ userId: login.body.user.id });
    expect(remaining).toBe(0);
  });

  it("should enforce the unique emailHash index at the database level", async () => {
    // Arrange
    const { encryptUserFields } = require("../utils/crypto");
    const users = getDb().collection("users");
    await users.insertOne(encryptUserFields({ name: "A", email: TEST_USER.email }));

    // Act / Assert : un second document avec le même email viole l'index unique.
    await expect(
      users.insertOne(encryptUserFields({ name: "B", email: TEST_USER.email }))
    ).rejects.toThrow(/duplicate key/i);
  });
});
