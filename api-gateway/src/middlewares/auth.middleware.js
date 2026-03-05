// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

/**
 * Verify JWT at Gateway.
 * - attaches req.user = { id, roles, email }
 * - forwards authorization header to upstream (req.authHeader)
 *
 * NOTE:
 * Token của bạn (đã gửi trước) có:
 *  - iss: "auth-service"
 *  - aud: "it-social-platform"
 * -> env.JWT_ISSUER và env.JWT_AUDIENCE phải khớp
 */
function authMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    const cid = req.correlationId;

    try {
      const authHeader = req.headers?.authorization || req.headers?.Authorization || "";
      const [scheme, rawToken] = String(authHeader).split(" ");
      const token = scheme?.toLowerCase() === "bearer" ? rawToken : null;

      if (!token) {
        console.log("[AUTH] Missing Bearer token", { cid });
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Missing Bearer token",
          correlationId: cid,
        });
      }

      // ✅ Verify JWT (issuer/audience must match token)
      // If you want to temporarily bypass issuer/audience for debugging, comment the options object.
      const verifyOptions = {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      };

      let payload;
      try {
        payload = jwt.verify(token, env.JWT_SECRET, verifyOptions);
      } catch (err) {
        // 🔥 LOG CHI TIẾT lỗi verify
        console.log("[AUTH VERIFY FAIL]", {
          cid,
          name: err?.name,
          message: err?.message,
          // show what gateway expects (helps spot env mismatch)
          expectedIssuer: env.JWT_ISSUER,
          expectedAudience: env.JWT_AUDIENCE,
        });
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid or expired token",
          correlationId: cid,
        });
      }

      // ✅ Robust userId mapping
      const userId =
        payload?.sub ||
        payload?.userId ||
        payload?.id ||
        payload?.nameid ||
        payload?.uid ||
        payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        null;

      if (!userId) {
        console.log("[AUTH] Token missing user identifier", { cid, payloadKeys: Object.keys(payload || {}) });
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Token missing user identifier",
          correlationId: cid,
        });
      }

      // ✅ Roles mapping
      let roles = payload.roles || payload.role || [];
      if (!Array.isArray(roles)) roles = typeof roles === "string" ? [roles] : [];

      const user = {
        id: String(userId),
        email: payload.email || payload.unique_name || null,
        roles,
      };

      // ✅ Debug log mapping success (bạn có thể tắt sau khi ổn)
      console.log("[AUTH OK]", {
        cid,
        userId: user.id,
        issuer: payload.iss,
        audience: payload.aud,
      });

      // Role check (optional)
      if (requiredRoles.length > 0) {
        const ok = requiredRoles.some((r) => user.roles.includes(r));
        if (!ok) {
          console.log("[AUTH] Forbidden role", { cid, userRoles: user.roles, requiredRoles });
          return res.status(403).json({
            success: false,
            message: "Forbidden: Insufficient role",
            correlationId: cid,
          });
        }
      }

      // Attach to request (for controller -> ctx)
      req.user = user;
      req.authHeader = authHeader;

      return next();
    } catch (err) {
      // Catch-all (should be rare)
      console.log("[AUTH] Unexpected error", {
        cid,
        name: err?.name,
        message: err?.message,
      });
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        correlationId: cid,
      });
    }
  };
}

module.exports = { authMiddleware };