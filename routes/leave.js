const express = require("express");
const router = express.Router();
const pool = require("../db");

// Leave application page
router.get("/apply", (req, res) => {
  if (!req.session.employeeId) {
    return res.redirect("/login");
  }
  res.render("apply_leave");
});

// Apply leave (POST)
router.post("/apply", async (req, res) => {
  try {
    if (!req.session.employeeId) {
      return res.redirect("/login");
    }

    const { start_date, end_date, reason } = req.body;
    const employeeId = req.session.employeeId;

    await pool.query(
      `
      INSERT INTO leave_requests 
      (employee_id, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [employeeId, start_date, end_date, reason, "Pending"]
    );

    res.redirect("/");
  } catch (err) {
    console.error("❌ Leave Apply Error:", err);
    res.send("Failed to apply leave");
  }
});

module.exports = router;
