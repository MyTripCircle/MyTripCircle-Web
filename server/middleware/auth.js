const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { JWT_SECRET } = require("../config");
const { getDb } = require("../db");
const { decryptUserFields } = require("../utils/crypto");
const { readAccessTokenFromCookie } = require("../utils/authCookies");
const logger = require("../utils/logger");

// L'en-tête reste prioritaire : un client mobile ou un appel serveur explicite
// doit pouvoir surcharger un éventuel cookie résiduel du navigateur.
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];
  return readAccessTokenFromCookie(req);
}

async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: "Non autorisé" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const user = await getDb()
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ success: false, error: "Non autorisé" });
    }

    // Autoriser l'accès à cancel-deletion même si le compte est en attente de suppression
    const isCancelDeletion = req.path === "/me/cancel-deletion" && req.method === "POST";
    if (user.pendingDeletion && !isCancelDeletion) {
      return res.status(403).json({
        success: false,
        error: "Compte en cours de suppression",
        pendingDeletion: true,
        deletionScheduledAt: user.deletionScheduledAt,
      });
    }

    req.user = decryptUserFields(user);
    next();
  } catch (e) {
    logger.warn("[auth] Token invalide ou expiré:", e.message);
    return res.status(401).json({ success: false, error: "Non autorisé" });
  }
}

module.exports = { requireAuth, extractToken };
