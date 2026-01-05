const express = require("express");
const router = express.Router();
const pool = require("../db"); // your PostgreSQL connection

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
  if (req.session.employeeId) next();
  else res.redirect("/login");
}

// GET attendance page
router.get("/", checkAuth, async (req, res) => {
  try {
    // Fetch attendance for logged-in employee
    const result = await pool.query(
      "SELECT * FROM attendance WHERE employee_id = $1 ORDER BY date DESC",
      [req.session.employeeId]
    );
    res.render("attendance", { attendance: result.rows });
  } catch (err) {
    console.error(err);
    res.send("Error fetching attendance");
  }
});

// POST mark attendance (optional)
router.post("/mark", checkAuth, async (req, res) => {
  try {
    const today = new Date();
    await pool.query(
      "INSERT INTO attendance(employee_id, date, status) VALUES($1, $2, $3)",
      [req.session.employeeId, today, "Present"]
    );
    res.redirect("/attendance");
  } catch (err) {
    console.error(err);
    res.send("Error marking attendance");
  }
});

module.exports = router;
