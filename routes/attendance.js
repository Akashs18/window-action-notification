const express = require("express");
const router = express.Router();
const db = require("../db");

// Apply leave
router.get("/apply", (req, res) => res.render("apply_leave"));

router.post("/apply", (req, res) => {
  const { start_date, end_date, reason } = req.body;
  const employeeId = req.session.employeeId;

  db.query(
    "INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) VALUES ($1, $2, $3, $4, 'Pending')",
    [employeeId, start_date, end_date, reason],
    (err) => {
      if (err) throw err;
      res.send("Leave applied successfully!");
    }
  );
});

module.exports = router;
