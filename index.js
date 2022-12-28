const express = require("express");

const { connectDB } = require("./config/db");
const userRoutes = require("./routes/user");

const PORT = 1337;

const app = express();
connectDB();

app.use(express.json());

express.static("Content");

// Routes
app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});