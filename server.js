// server.js
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"] }));

// 🧠 PostgreSQL Connection (Render DB)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Health check route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ CavrixCore API is Live and Connected to Render",
    timestamp: new Date().toISOString(),
  });
});

// 📨 Contact form route — save to DB
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query("INSERT INTO leads (name, email, message) VALUES ($1, $2, $3)", [name, email, message]);
    res.json({ success: true, message: "Lead stored successfully" });
  } catch (err) {
    console.error("DB Insert Error:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// 👁️ Admin route — fetch all leads
app.get("/api/admin/leads", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
    res.json({ success: true, leads: rows });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch leads" });
  }
});

// ❌ Delete a lead
app.delete("/api/admin/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM leads WHERE id=$1", [id]);
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, error: "Failed to delete lead" });
  }
});

// 🌍 Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 CavrixCore API running on port ${PORT}`));
