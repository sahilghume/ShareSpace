const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
// const choreRoutes = require("./routes/choreRoutes");
const shoppingRoutes = require("./routes/shoppingRoutes");
// const maintenanceRoutes = require("./routes/maintenanceRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
// app.use("/api/chores", choreRoutes);
app.use("/api/shopping", shoppingRoutes);
// app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notices", noticeRoutes);

// app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to ShareSpace Backend!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ShareSpace server running on port ${PORT}`);
});
