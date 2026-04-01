const router = require("express").Router();
const { v4: uuid } = require("uuid");
const db     = require("../db");
const { auth, requireRole } = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  const items = [...db.inventory].sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  res.json(items);
});

router.post("/", auth, requireRole("admin","manager"), (req, res) => {
  const item = { _id: uuid(), ...req.body, createdAt: new Date().toISOString() };
  db.inventory.push(item);
  res.status(201).json(item);
});

router.put("/:id", auth, requireRole("admin","manager"), (req, res) => {
  const idx = db.inventory.findIndex(i => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  db.inventory[idx] = { ...db.inventory[idx], ...req.body };
  res.json(db.inventory[idx]);
});

router.patch("/:id/quantity", auth, requireRole("admin","manager"), (req, res) => {
  const item = db.inventory.find(i => i._id === req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  item.quantity = Math.max(0, item.quantity + Number(req.body.delta));
  res.json(item);
});

router.delete("/:id", auth, requireRole("admin"), (req, res) => {
  const idx = db.inventory.findIndex(i => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  db.inventory.splice(idx, 1);
  res.json({ message: "Deleted" });
});

// kept for compatibility
router.post("/seed", auth, requireRole("admin"), (req, res) => {
  res.json({ message: "Inventory already seeded" });
});

module.exports = router;
