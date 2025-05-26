require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/dbConnect");
const mongoose = require("mongoose");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const path = require("path");
const seedMajors = require("./seeding/majorSeeding");
connectDB();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/roots"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/examRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use(require("./MiddleWares/errorHandler"));
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.send("<h1>404 Not Found</h1>");
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", async () => {
  console.log("mongoDB connected successfully");
  await seedMajors();
  app.listen(PORT, () => {
    console.log("listening on port 5000");
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
