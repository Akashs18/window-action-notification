const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

// Settings
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

// Make session variables available globally in EJS
app.use((req, res, next) => {
  res.locals.employeeName = req.session.employeeName || null;
  next();
});

// Authentication middleware
function checkAuth(req, res, next) {
  if (req.session.employeeId) next();
  else res.redirect("/login");
}

// ===== ROUTES =====

// Dashboard
app.get("/", checkAuth, (req, res) => res.render("dashboard"));

// Signup
app.get("/signup", (req, res) => res.render("signup"));

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO employees (name, email, password) VALUES ($1, $2, $3)",
    [name, email, hashedPassword],
    (err) => {
      if (err) return res.send("Error: Email may already exist");
      res.redirect("/login");
    }
  );
});

// Login
app.get("/login", (req, res) => res.render("login"));

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM employees WHERE email = $1", [email], async (err, result) => {
    if (err) throw err;

    if (result.rows.length === 0) return res.send("Invalid email or password");

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.employeeId = user.id;
      req.session.employeeName = user.name;
      res.redirect("/");
    } else {
      res.send("Invalid email or password");
    }
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Routes
const attendanceRoutes = require("./routes/attendance");
const leaveRoutes = require("./routes/leave");
app.use("/attendance", checkAuth, attendanceRoutes);
app.use("/leave", checkAuth, leaveRoutes);

// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
