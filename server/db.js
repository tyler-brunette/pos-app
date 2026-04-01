const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

// ── helpers ───────────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();
const id  = () => uuid();

// ── seed data ─────────────────────────────────────────────────────────────────
const USERS = [
  { _id: id(), name: "Admin",       email: "admin@cafe.com",   passwordHash: bcrypt.hashSync("admin123", 10),   role: "admin",   hourlyRate: 25, phone: "(517) 555-0001", active: true, createdAt: now() },
  { _id: id(), name: "Sara Manager",email: "sara@cafe.com",    passwordHash: bcrypt.hashSync("manager123", 10), role: "manager", hourlyRate: 20, phone: "(517) 555-0002", active: true, createdAt: now() },
  { _id: id(), name: "Jake Barista", email: "jake@cafe.com",   passwordHash: bcrypt.hashSync("barista123", 10), role: "barista", hourlyRate: 15, phone: "(517) 555-0003", active: true, createdAt: now() },
  { _id: id(), name: "Mia Barista",  email: "mia@cafe.com",    passwordHash: bcrypt.hashSync("barista123", 10), role: "barista", hourlyRate: 15, phone: "(517) 555-0004", active: true, createdAt: now() },
  { _id: id(), name: "Tom Barista",  email: "tom@cafe.com",    passwordHash: bcrypt.hashSync("barista123", 10), role: "barista", hourlyRate: 15, phone: "(517) 555-0005", active: false, createdAt: now() },
];

const MENU_ITEMS = [
  { _id: id(), name: "Espresso",         category: "espresso", price: 3.00, description: "Double shot",              available: true },
  { _id: id(), name: "Americano",        category: "espresso", price: 3.50, description: "Espresso + hot water",     available: true },
  { _id: id(), name: "Latte",            category: "espresso", price: 4.75, description: "Espresso + steamed milk",  available: true },
  { _id: id(), name: "Cappuccino",       category: "espresso", price: 4.50, description: "Espresso + foam",          available: true },
  { _id: id(), name: "Flat White",       category: "espresso", price: 4.75, description: "Ristretto + microfoam",    available: true },
  { _id: id(), name: "Mocha",            category: "espresso", price: 5.25, description: "Espresso + chocolate",     available: true },
  { _id: id(), name: "Drip Coffee",      category: "drip",     price: 2.75, description: "House blend",              available: true },
  { _id: id(), name: "Cold Brew",        category: "drip",     price: 4.00, description: "12-hour steep",            available: true },
  { _id: id(), name: "Chai Latte",       category: "tea",      price: 4.50, description: "Spiced chai + milk",       available: true },
  { _id: id(), name: "Matcha Latte",     category: "tea",      price: 5.00, description: "Ceremonial grade",         available: true },
  { _id: id(), name: "Croissant",        category: "food",     price: 3.50, description: "Butter croissant",         available: true },
  { _id: id(), name: "Avocado Toast",    category: "food",     price: 8.00, description: "Sourdough + avo",          available: true },
  { _id: id(), name: "Blueberry Muffin", category: "food",     price: 3.25, description: "Baked fresh daily",        available: true },
];

const INVENTORY = [
  { _id: id(), name: "Espresso Beans",   category: "beans",    quantity: 25,  unit: "lbs",     lowStockThreshold: 5,  cost: 18,   supplier: "Blue Bottle" },
  { _id: id(), name: "Drip Blend Beans", category: "beans",    quantity: 15,  unit: "lbs",     lowStockThreshold: 5,  cost: 14,   supplier: "Blue Bottle" },
  { _id: id(), name: "Whole Milk",       category: "dairy",    quantity: 12,  unit: "gallons", lowStockThreshold: 3,  cost: 4,    supplier: "Local Dairy" },
  { _id: id(), name: "Oat Milk",         category: "dairy",    quantity: 3,   unit: "gallons", lowStockThreshold: 3,  cost: 6,    supplier: "Oatly" },
  { _id: id(), name: "Vanilla Syrup",    category: "syrups",   quantity: 6,   unit: "bottles", lowStockThreshold: 2,  cost: 8,    supplier: "Monin" },
  { _id: id(), name: "Caramel Syrup",    category: "syrups",   quantity: 2,   unit: "bottles", lowStockThreshold: 2,  cost: 8,    supplier: "Monin" },
  { _id: id(), name: "Hazelnut Syrup",   category: "syrups",   quantity: 1,   unit: "bottles", lowStockThreshold: 2,  cost: 8,    supplier: "Monin" },
  { _id: id(), name: "Croissants",       category: "food",     quantity: 24,  unit: "units",   lowStockThreshold: 6,  cost: 1.5,  supplier: "Local Bakery" },
  { _id: id(), name: "Muffins",          category: "food",     quantity: 4,   unit: "units",   lowStockThreshold: 6,  cost: 1.2,  supplier: "Local Bakery" },
  { _id: id(), name: "Paper Cups 12oz",  category: "supplies", quantity: 200, unit: "units",   lowStockThreshold: 50, cost: 0.1,  supplier: "Sysco" },
  { _id: id(), name: "Paper Cups 16oz",  category: "supplies", quantity: 40,  unit: "units",   lowStockThreshold: 50, cost: 0.12, supplier: "Sysco" },
  { _id: id(), name: "Lids",             category: "supplies", quantity: 300, unit: "units",   lowStockThreshold: 75, cost: 0.05, supplier: "Sysco" },
  { _id: id(), name: "Matcha Powder",    category: "other",    quantity: 2,   unit: "lbs",     lowStockThreshold: 0.5,cost: 30,   supplier: "Ippodo" },
];

// Generate some sample orders for the dashboard
function makeSampleOrders(users, menuItems) {
  const baristas = users.filter(u => u.active);
  const orders = [];
  const statuses = ["completed", "completed", "completed", "completed", "voided"];
  const payments = ["card", "card", "card", "cash"];

  for (let i = 0; i < 18; i++) {
    const daysAgo = Math.floor(i / 4);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);

    const itemCount = 1 + Math.floor(Math.random() * 3);
    const items = [];
    for (let j = 0; j < itemCount; j++) {
      const mi = menuItems[Math.floor(Math.random() * menuItems.length)];
      const existing = items.find(x => x.menuItem === mi._id);
      if (existing) { existing.quantity++; }
      else items.push({ menuItem: mi._id, name: mi.name, price: mi.price, quantity: 1, notes: "" });
    }
    const subtotal = items.reduce((t, x) => t + x.price * x.quantity, 0);
    const total    = +(subtotal * 1.06).toFixed(2);
    const barista  = baristas[Math.floor(Math.random() * baristas.length)];

    orders.push({
      _id: id(),
      items,
      total,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: payments[Math.floor(Math.random() * payments.length)],
      servedBy: barista._id,
      customerName: ["", "Alex", "Sam", "Jordan", "Casey", ""][Math.floor(Math.random() * 6)],
      createdAt: d.toISOString(),
      updatedAt: d.toISOString(),
    });
  }
  return orders;
}

// Generate a week of sample shifts
function makeSampleShifts(users) {
  const active = users.filter(u => u.active);
  const shifts = [];
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const patterns = [
    { startTime: "06:00", endTime: "14:00" },
    { startTime: "10:00", endTime: "18:00" },
    { startTime: "14:00", endTime: "21:00" },
  ];

  for (let day = 0; day < 7; day++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + day);
    const dateStr = d.toISOString().split("T")[0];
    const dayStaff = active.slice(0, 2 + (day % 2));
    dayStaff.forEach((emp, i) => {
      shifts.push({
        _id: id(),
        employee: emp._id,
        date: dateStr,
        startTime: patterns[i % patterns.length].startTime,
        endTime:   patterns[i % patterns.length].endTime,
        notes: "",
        createdAt: now(),
      });
    });
  }
  return shifts;
}

// ── in-memory store ────────────────────────────────────────────────────────────
const db = {
  users:     [...USERS],
  menuItems: [...MENU_ITEMS],
  inventory: [...INVENTORY],
  orders:    makeSampleOrders(USERS, MENU_ITEMS),
  shifts:    makeSampleShifts(USERS),
};

module.exports = db;
