import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

// Connect DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test route
app.get("/", async (req, res) => {
  res.send("✅ CavrixCore API is live!");
});

// DB test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
import contactRoutes from "./routes/contactRoutes.js";
app.use("/api", contactRoutes);
// ✅ Healthcheck route (Render + Netlify Test)
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ CavrixCore API is Live and Connected to Render',
    timestamp: new Date().toISOString()
  });
});
