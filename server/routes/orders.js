const router = require("express").Router();
const { v4: uuid } = require("uuid");
const db     = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// GET /api/orders/stats  — must be BEFORE /:id route
router.get("/stats", auth, requireRole("admin","manager"), (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const weekAgo = new Date(today - 7 * 86400000);

  const completed = db.orders.filter(o => o.status === "completed");
  const todayOrders = completed.filter(o => new Date(o.createdAt) >= today);
  const weekOrders  = completed.filter(o => new Date(o.createdAt) >= weekAgo);

  const sum = arr => arr.reduce((t,o) => t + o.total, 0);
  res.json({
    todayCount:    todayOrders.length,
    todayRevenue:  sum(todayOrders),
    weekCount:     weekOrders.length,
    weekRevenue:   sum(weekOrders),
    allTimeRevenue:sum(completed),
  });
});

router.get("/", auth, (req, res) => {
  const { status, limit = 50 } = req.query;
  let orders = [...db.orders];
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  orders = orders.slice(0, Number(limit));

  // populate servedBy
  const populated = orders.map(o => ({
    ...o,
    servedBy: db.users.find(u => u._id === o.servedBy)
      ? { _id: o.servedBy, name: db.users.find(u => u._id === o.servedBy).name }
      : null,
  }));
  res.json(populated);
});

router.post("/", auth, (req, res) => {
  const order = {
    _id: uuid(),
    ...req.body,
    servedBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.orders.push(order);
  res.status(201).json(order);
});

router.patch("/:id/status", auth, (req, res) => {
  const order = db.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

module.exports = router;
