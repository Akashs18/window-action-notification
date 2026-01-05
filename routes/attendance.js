const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * Authentication middleware
 */
function checkAuth(req, res, next) {
  if (!req.session.employeeId) {
    return res.redirect("/login");
  }
  next();
}

/**
 * GET /attendance
 * Show attendance records
 */
router.get("/", checkAuth, async (req, res) => {
  try {
    const employeeId = req.session.employeeId;

    // Fetch attendance records
    const recordsResult = await pool.query(
      `
      SELECT attendance_date, status
      FROM attendance
      WHERE employee_id = $1
      ORDER BY attendance_date DESC
      `,
      [employeeId]
    );

    // Check if attendance already marked today
    const todayResult = await pool.query(
      `
      SELECT 1
      FROM attendance
      WHERE employee_id = $1
        AND attendance_date = CURRENT_DATE
      `,
      [employeeId]
    );

    res.render("attendance", {
      records: recordsResult.rows,
      markedToday: todayResult.rowCount > 0
    });
  } catch (err) {
    console.error("❌ Fetch Attendance Error:", err);
    res.status(500).send("Failed to load attendance");
  }
});

/**
 * POST /attendance/mark
 * Mark attendance (only once per day)
 */
router.post("/mark", checkAuth, async (req, res) => {
  try {
    const employeeId = req.session.employeeId;

    await pool.query(
      `
      INSERT INTO attendance (employee_id, attendance_date, status)
      VALUES ($1, CURRENT_DATE, 'Present')
      `,
      [employeeId]
    );

    res.redirect("/attendance");
  } catch (err) {
    // Unique constraint prevents duplicate attendance
    if (err.code === "23505") {
      return res.send("❌ Attendance already marked for today");
    }

    console.error("❌ Mark Attendance Error:", err);
    res.status(500).send("Failed to mark attendance");
  }
});

module.exports = router;
