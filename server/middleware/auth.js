const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Insufficient permissions" });
  next();
};

module.exports = { auth, requireRole };
