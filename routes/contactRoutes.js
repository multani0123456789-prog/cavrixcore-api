import express from "express";
import pkg from "pg";
const { Pool } = pkg;
const router = express.Router();

// Connect to Postgres database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Contact form route
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create table if not exists
    await pool.query(
      "CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, name TEXT, email TEXT, message TEXT, created_at TIMESTAMP DEFAULT NOW())"
    );

    // Insert into table
    await pool.query(
      "INSERT INTO contacts(name, email, message) VALUES($1, $2, $3)",
      [name, email, message]
    );

    res.json({ success: true, message: "Message stored successfully!" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
