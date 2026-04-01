require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/menu",      require("./routes/menu"));
app.use("/api/orders",    require("./routes/orders"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/schedule",  require("./routes/schedule"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (in-memory store)`));
