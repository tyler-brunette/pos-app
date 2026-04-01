const router = require("express").Router();
const { v4: uuid } = require("uuid");
const db     = require("../db");
const { auth, requireRole } = require("../middleware/auth");

const populateShift = (shift) => ({
  ...shift,
  employee: db.users.find(u => u._id === shift.employee)
    ? { _id: shift.employee, name: db.users.find(u => u._id === shift.employee).name, role: db.users.find(u => u._id === shift.employee).role }
    : null,
});

router.get("/", auth, (req, res) => {
  const { weekStart } = req.query;
  let shifts = [...db.shifts];

  if (weekStart) {
    const start = new Date(weekStart);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    shifts = shifts.filter(s => dates.includes(s.date));
  }

  shifts.sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  res.json(shifts.map(populateShift));
});

router.post("/", auth, requireRole("admin","manager"), (req, res) => {
  const shift = { _id: uuid(), ...req.body, createdAt: new Date().toISOString() };
  db.shifts.push(shift);
  res.status(201).json(populateShift(shift));
});

router.put("/:id", auth, requireRole("admin","manager"), (req, res) => {
  const idx = db.shifts.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  db.shifts[idx] = { ...db.shifts[idx], ...req.body };
  res.json(populateShift(db.shifts[idx]));
});

router.delete("/:id", auth, requireRole("admin","manager"), (req, res) => {
  const idx = db.shifts.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  db.shifts.splice(idx, 1);
  res.json({ message: "Deleted" });
});

module.exports = router;
