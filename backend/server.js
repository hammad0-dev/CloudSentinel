const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://192.168.141.128:5173",
  "http://192.168.37.122:5173",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/sast", require("./routes/sast"));

const healthPayload = { ok: true, service: "CloudSentinel API" };

app.get("/", (req, res) => {
  res.json({
    message: "CloudSentinel API running",
    health: "/api/health",
  });
});

app.get("/health", (req, res) => {
  res.json(healthPayload);
});

app.get("/api/health", (req, res) => {
  res.json(healthPayload);
});

const boot = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

boot().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
