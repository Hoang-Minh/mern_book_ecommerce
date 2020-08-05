require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user.js");
// app
const app = express();

//db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connected"));

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
