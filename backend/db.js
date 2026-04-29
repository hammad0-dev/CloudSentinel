const { Pool } = require("pg");

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME || "cloudsentinel";
  const user = process.env.DB_USER || "postgres";
  const password = process.env.DB_PASSWORD || "";
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(password);
  return `postgresql://${encUser}:${encPass}@${host}:${port}/${name}`;
}

const pool = new Pool({
  connectionString: getConnectionString(),
});

module.exports = pool;
