const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const db     = require("../db");
const { auth } = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, SECRET, { expiresIn: "12h" });

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.active);
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ message: "Invalid credentials" });
  const { passwordHash, ...safe } = user;
  res.json({ token: sign(user), user: { id: user._id, name: user.name, role: user.role, email: user.email } });
});

// GET /api/auth/me
router.get("/me", auth, (req, res) => {
  const user = db.users.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// POST /api/auth/seed — kept for compatibility, always returns success
router.post("/seed", (req, res) => {
  res.json({ message: "Admin created: admin@cafe.com / admin123" });
});

module.exports = router;
