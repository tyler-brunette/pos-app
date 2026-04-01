const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const db     = require("../db");
const { auth, requireRole } = require("../middleware/auth");

const sanitize = ({ passwordHash, ...rest }) => rest;

router.get("/", auth, requireRole("admin","manager"), (req, res) => {
  res.json(db.users.map(sanitize).sort((a,b) => a.name.localeCompare(b.name)));
});

router.post("/", auth, requireRole("admin"), (req, res) => {
  const { password, ...rest } = req.body;
  if (!password) return res.status(400).json({ message: "Password required" });
  const user = {
    _id: uuid(),
    ...rest,
    passwordHash: bcrypt.hashSync(password, 10),
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  res.status(201).json(sanitize(user));
});

router.put("/:id", auth, requireRole("admin"), (req, res) => {
  const idx = db.users.findIndex(u => u._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  const { password, ...rest } = req.body;
  db.users[idx] = {
    ...db.users[idx],
    ...rest,
    ...(password ? { passwordHash: bcrypt.hashSync(password, 10) } : {}),
  };
  res.json(sanitize(db.users[idx]));
});

router.patch("/:id/toggle", auth, requireRole("admin"), (req, res) => {
  const user = db.users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  user.active = !user.active;
  res.json({ active: user.active });
});

module.exports = router;
