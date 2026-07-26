// @ts-check
/**
 * Stateful in-memory mock of the backend API Gateway, used only by the E2E suite.
 *
 * The Next.js app under test points BACKEND_API_URL at this server, so every request
 * flows through the real BFF chain: browser → Next route handler → serverApi → here.
 * That exercises cookie persistence, the auth-aware header, and the proxy for real —
 * without depending on the actual backend being up.
 *
 * Tokens are JWT-shaped (`header.<base64url payload>.sig`) so that the app's
 * unverified email/sub decode in `src/lib/auth/session.ts` works unchanged. User
 * identity is carried in the token's `sub`; profile + permissions are resolved from
 * the in-memory registry so updates are reflected on the next `GET /api/users/me`.
 *
 * Zero dependencies (plain Node ESM) so Playwright can boot it with `node` directly.
 */

import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_BACKEND_PORT ?? 8899);

/** Credentials shared with the E2E fixtures (see tests/common/users.ts). */
const PASSWORD = "Password12345";

/** @typedef {{ userId: string, email: string, password: string, firstName: string, lastName: string, studentType: string, emailVerified: boolean, isActive: boolean, permissions: string[] }} User */

/** Seed users, keyed by id. Registration appends new entries. @type {Map<string, User>} */
const usersById = new Map();
/** Email → userId index for login lookups. @type {Map<string, string>} */
const usersByEmail = new Map();

/** @param {User} u */
function addUser(u) {
  usersById.set(u.userId, u);
  usersByEmail.set(u.email.toLowerCase(), u.userId);
}

const ADMIN_PERMISSIONS = [
  "users.read", "users.manage",
  "roles.read", "roles.manage",
  "permissions.read", "permissions.manage",
  "members.read", "members.manage",
  "tenants.read", "tenants.manage",
];

function seed() {
  usersById.clear();
  usersByEmail.clear();
  addUser({
    userId: "u-student", email: "student@test.local", password: PASSWORD,
    firstName: "Deniz", lastName: "Yılmaz", studentType: "HighSchool",
    emailVerified: true, isActive: true, permissions: [],
  });
  addUser({
    userId: "u-admin", email: "admin@test.local", password: PASSWORD,
    firstName: "Admin", lastName: "Koç", studentType: "Graduate",
    emailVerified: true, isActive: true, permissions: ADMIN_PERMISSIONS,
  });
}
seed();

// ---- token helpers -------------------------------------------------------

const b64url = (/** @type {object} */ obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

/** @param {string} sub @param {string} email */
function makeJwt(sub, email) {
  return `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub, email })}.sig`;
}

/** Decodes the `sub` claim from a JWT-shaped token, or null. @param {string | undefined} token */
function subFromToken(token) {
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof json.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}

/** @param {User} user */
function issueTokens(user) {
  const in15min = new Date(Date.now() + 15 * 60_000).toISOString();
  const in7days = new Date(Date.now() + 7 * 24 * 3600_000).toISOString();
  return {
    accessToken: makeJwt(user.userId, user.email),
    accessTokenExpiresAtUtc: in15min,
    refreshToken: makeJwt(user.userId, user.email),
    refreshTokenExpiresAtUtc: in7days,
  };
}

/** @param {User} u */
const authUser = (u) => ({
  id: u.userId, email: u.email, firstName: u.firstName, lastName: u.lastName,
  studentType: u.studentType, emailVerified: u.emailVerified, isActive: u.isActive,
});

/** @param {User} u */
const currentUser = (u) => ({
  userId: u.userId, email: u.email, firstName: u.firstName, lastName: u.lastName,
  studentType: u.studentType, sessionId: "s-1", accessTokenJti: "jti-1", permissions: u.permissions,
});

// ---- tiny router ---------------------------------------------------------

/** @param {import("node:http").ServerResponse} res @param {number} status @param {unknown} [body] */
function send(res, status, body) {
  if (body === undefined) {
    res.writeHead(status).end();
    return;
  }
  const json = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" }).end(json);
}

/** @param {import("node:http").ServerResponse} res @param {number} status @param {string} title @param {string} [detail] */
function problem(res, status, title, detail) {
  send(res, status, { type: "about:blank", title, status, detail });
}

/** Resolves the authenticated user from the Authorization header, or null. */
function authed(/** @type {import("node:http").IncomingMessage} */ req) {
  const header = req.headers["authorization"];
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  const sub = subFromToken(token);
  return sub ? usersById.get(sub) ?? null : null;
}

const server = createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    /** @type {any} */
    let body = {};
    if (raw) { try { body = JSON.parse(raw); } catch { body = {}; } }

    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    const path = url.pathname;
    const method = req.method ?? "GET";
    const route = `${method} ${path}`;

    // Test-only reset hook so specs can restore seed data between runs.
    if (route === "POST /__reset") { seed(); return send(res, 204); }

    // ---- public auth ----
    if (route === "POST /api/auth/login") {
      const id = usersByEmail.get(String(body.email ?? "").toLowerCase());
      const user = id ? usersById.get(id) : undefined;
      if (!user || user.password !== body.password) {
        return problem(res, 401, "Geçersiz kimlik bilgileri", "E-posta veya şifre hatalı.");
      }
      return send(res, 200, {
        user: authUser(user), tokens: issueTokens(user), mfaChallenge: null, requiresMfa: false,
      });
    }

    if (route === "POST /api/auth/register") {
      const email = String(body.email ?? "").toLowerCase();
      if (usersByEmail.has(email)) {
        return problem(res, 409, "E-posta kullanımda", "Bu e-posta ile bir hesap zaten var.");
      }
      /** @type {User} */
      const user = {
        userId: `u-${usersById.size + 1}`, email: body.email, password: body.password,
        firstName: body.firstName, lastName: body.lastName, studentType: body.studentType,
        emailVerified: false, isActive: true, permissions: [],
      };
      addUser(user);
      return send(res, 201, { user: authUser(user) });
    }

    if (route === "POST /api/auth/forgot-password")
      return send(res, 200, { message: "Sıfırlama bağlantısı gönderildi." });
    if (route === "POST /api/auth/resend-verification")
      return send(res, 200, { message: "Doğrulama e-postası tekrar gönderildi." });
    if (route === "POST /api/auth/reset-password") return send(res, 204);
    if (route === "POST /api/auth/verify-email") return send(res, 204);
    if (route === "POST /api/auth/change-email/confirm") return send(res, 204);
    if (route === "POST /api/auth/change-password/confirm") return send(res, 204);
    if (route === "GET /api/auth/change-email/validate")
      return send(res, 200, { isValid: true, message: "Bağlantı geçerli." });

    if (route === "POST /api/auth/refresh") {
      const sub = subFromToken(body.refreshToken);
      const user = sub ? usersById.get(sub) : undefined;
      if (!user) return problem(res, 401, "Yetkisiz", "Yenileme jetonu geçersiz.");
      return send(res, 200, { tokens: issueTokens(user) });
    }

    // ---- everything below requires a bearer token ----
    const user = authed(req);
    if (!user) return problem(res, 401, "Yetkisiz", "Oturum gerekli.");

    if (route === "POST /api/auth/logout") return send(res, 204);
    if (route === "POST /api/auth/logout-all") return send(res, 204);
    if (route === "POST /api/auth/change-email/request")
      return send(res, 200, { message: "E-posta değişikliği bağlantısı gönderildi." });
    if (route === "POST /api/auth/change-password/request")
      return send(res, 200, { message: "Şifre değişikliği bağlantısı gönderildi." });

    if (route === "GET /api/users/me") return send(res, 200, currentUser(user));
    if (route === "PUT /api/users/me/update") {
      if (typeof body.firstName === "string") user.firstName = body.firstName;
      if (typeof body.lastName === "string") user.lastName = body.lastName;
      if (typeof body.studentType === "string") user.studentType = body.studentType;
      return send(res, 200, currentUser(user));
    }

    if (route === "GET /api/sessions")
      return send(res, 200, [
        {
          sessionId: "s-1", deviceName: "E2E Chromium", ipAddress: "127.0.0.1",
          createdAtUtc: new Date().toISOString(), revoked: false, revokedAtUtc: null, isCurrent: true,
        },
      ]);
    if (method === "DELETE" && path.startsWith("/api/sessions/")) return send(res, 204);

    // ---- admin list endpoints (panels fetch these on mount) ----
    if (route === "GET /api/tenants") return send(res, 200, []);
    if (route === "GET /api/roles") return send(res, 200, []);
    if (route === "GET /api/permissions") return send(res, 200, []);
    if (route === "GET /api/memberships") return send(res, 200, []);
    if (route === "GET /api/memberships/me") return send(res, 200, []);

    return problem(res, 404, "Bulunamadı", `Mock backend: ${route} tanımlı değil.`);
  });
});

server.listen(PORT, () => {
  console.log(`[mock-backend] listening on http://localhost:${PORT}`);
});
