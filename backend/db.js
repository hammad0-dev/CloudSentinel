const { Pool } = require("pg");

/**
 * Postgres SCRAM auth requires password to be a string. Undefined/null (often from a
 * DATABASE_URL with no `user:password@` segment or a missing DB_PASSWORD line) triggers:
 * SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
 */
function getPoolConfig() {
  const rawUrl = (process.env.DATABASE_URL || "").trim();

  if (rawUrl) {
    try {
      const normalized = /^postgres(ql)?:\/\//i.test(rawUrl)
        ? rawUrl.replace(/^postgres(ql)?:/i, "http:")
        : rawUrl;
      const u = new URL(normalized);
      const user = decodeURIComponent(u.username || "postgres");
      const pw = u.password !== "" && u.password != null ? decodeURIComponent(u.password) : "";
      const host = u.hostname || "localhost";
      const port = Number.parseInt(u.port || "5432", 10);
      const database = (u.pathname || "").replace(/^\//, "").split("/")[0] || "postgres";
      return {
        host,
        port: Number.isFinite(port) ? port : 5432,
        database,
        user: String(user),
        password: String(pw),
      };
    } catch {
      console.warn("[db] DATABASE_URL parse failed; falling back to DB_* env vars.");
    }
  }

  const port = Number.parseInt(process.env.DB_PORT || "5432", 10);
  return {
    host: process.env.DB_HOST || "localhost",
    port: Number.isFinite(port) ? port : 5432,
    database: process.env.DB_NAME || "cloudsentinel",
    user: String(process.env.DB_USER || "postgres"),
    password: String(process.env.DB_PASSWORD ?? ""),
  };
}

const pool = new Pool(getPoolConfig());

module.exports = pool;
