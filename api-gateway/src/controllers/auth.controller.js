// src/controllers/auth.controller.js
const { authClient } = require("../clients/auth.client");
const { userClient } = require("../clients/user.client");
const { env } = require("../config/env");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader, 
    user: req.user, 
  };
}

const authController = {
  async login(req, res, next) {
    try {
      const data = await authClient.login(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async refresh(req, res, next) {
    try {
      const data = await authClient.refresh(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async logout(req, res, next) {
    try {
      const data = await authClient.logout(req.body, ctxFromReq(req));
      res.json({ success: true, data, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  async register(req, res, next) {
    try {
      const data = await authClient.register(req.body, ctxFromReq(req));
      const profile = await ensureUserProfile(data, req.body, ctxFromReq(req));
      res.status(201).json({ success: true, data: { ...data, profile }, correlationId: req.correlationId });
    } catch (e) {
      next(e);
    }
  },

  googleLogin(req, res, next) {
    try {
      if (!env.GOOGLE_CLIENT_ID) {
        const err = new Error("Missing GOOGLE_CLIENT_ID.");
        err.status = 500;
        throw err;
      }

      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
      url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "openid email profile");
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "select_account");

      res.redirect(url.toString());
    } catch (e) {
      next(e);
    }
  },

  async googleCallback(req, res, next) {
    try {
      const code = String(req.query.code || "");
      const googleError = req.query.error;

      if (googleError) {
        return sendAuthFailure(res, `Google login failed: ${googleError}`);
      }

      if (!code) {
        return sendAuthFailure(res, "Google login failed: missing authorization code.");
      }

      const data = await authClient.googleCallback(
        { code, redirectUri: env.GOOGLE_REDIRECT_URI },
        ctxFromReq(req)
      );

      await ensureUserProfile(data, {}, ctxFromReq(req));

      return sendAuthSuccess(res, data);
    } catch (e) {
      const detail =
        e?.upstream?.data?.detail ||
        e?.upstream?.data?.message ||
        e?.message ||
        "Google login failed.";
      return sendAuthFailure(res, detail);
    }
  },
};

function normalizeProfileSeed(authData, body = {}, attempt = 0) {
  const userId = authData?.userId || authData?.id;
  const email = String(authData?.email || body?.email || "").trim().toLowerCase();
  const displayName = String(body?.displayName || authData?.displayName || email.split("@")[0] || "IT Social User").trim();
  const emailPrefix = email.split("@")[0] || "user";
  const safePrefix = emailPrefix.replace(/[^a-z0-9_]/gi, "").slice(0, 28) || "user";
  const compactId = String(userId || Date.now()).replace(/-/g, "");
  const suffix = attempt === 0 ? compactId.slice(0, 8) : compactId.slice(-12);
  const timestampSuffix = String(Date.now()).slice(-6);
  const uniqueSuffix = attempt > 1 ? `${suffix}${timestampSuffix}` : suffix;

  return {
    userId,
    studentCode: `REG${uniqueSuffix}`.slice(0, 20),
    username: `${safePrefix}_${uniqueSuffix}`.slice(0, 50),
    fullName: displayName,
    tdmuEmail: attempt === 0 ? email || null : null,
    department: "IT",
    major: null,
    className: null,
    enrollmentYear: null,
    avatarUrl: null,
    coverUrl: null,
    bio: null,
  };
}

async function ensureUserProfile(authData, body, ctx) {
  const baseSeed = normalizeProfileSeed(authData, body);
  if (!baseSeed.userId) return null;

  const profileCtx = { ...ctx, userId: baseSeed.userId, xUserId: baseSeed.userId };

  try {
    return await userClient.getUserById(baseSeed.userId, profileCtx);
  } catch (error) {
    const status = error?.response?.status || error?.status;
    if (status !== 404) {
      console.warn("[auth.controller] profile lookup warning:", error.message);
    }
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const seed = normalizeProfileSeed(authData, body, attempt);

    try {
      return await userClient.createUser(seed, profileCtx);
    } catch (error) {
      const status = error?.response?.status || error?.status;
      const upstreamMessage = error?.upstream?.data?.message || error?.response?.data?.message || error.message;

      if (status === 409 && attempt < 2) {
        console.warn("[auth.controller] profile bootstrap conflict, retrying:", upstreamMessage);
        continue;
      }

      console.warn("[auth.controller] profile bootstrap warning:", upstreamMessage);
      return { skipped: true, reason: "profile_bootstrap_failed", message: upstreamMessage };
    }
  }

  return { skipped: true, reason: "profile_bootstrap_failed" };
}

function sendAuthSuccess(res, data) {
  const userId = data?.userId;
  const email = data?.email;
  const accessToken = data?.accessToken;

  if (!userId || !accessToken) {
    return sendAuthFailure(res, "Google login failed: auth-service response is missing token.");
  }

  const user = {
    id: userId,
    userId,
    email,
    name: email,
    roles: data?.roles || [],
  };

  const frontendUrl = env.FRONTEND_URL.replace(/\/+$/, "");
  const payload = Buffer
    .from(JSON.stringify({ accessToken, user }), "utf8")
    .toString("base64url");
  const params = new URLSearchParams({ payload });

  res.redirect(302, `${frontendUrl}/auth/google/success?${params.toString()}`);
}

function sendAuthFailure(res, message) {
  const loginUrl = `${env.FRONTEND_URL.replace(/\/+$/, "")}/auth/login`;
  const flash = JSON.stringify({ type: "error", message });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline';");
  res.status(400).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Login failed</title></head>
<body>
<script>
sessionStorage.setItem("auth:flash", ${JSON.stringify(flash)});
window.location.replace(${JSON.stringify(loginUrl)});
</script>
</body></html>`);
}

module.exports = { authController };
