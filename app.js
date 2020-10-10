/* eslint-disable prettier/prettier */
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

// const mongoDB = "mongodb+srv://Othman-19:0780458241-Na@cluster0.6xcjv.mongodb.net/<dbname>?retryWrites=true&w=majority";
const mongoDB = "mongodb://Othman-19:0780458241-Na@cluster0-shard-00-00.6xcjv.mongodb.net:27017,cluster0-shard-00-01.6xcjv.mongodb.net:27017,cluster0-shard-00-02.6xcjv.mongodb.net:27017/<dbname>?ssl=true&replicaSet=atlas-12kjph-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:"),
);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const inventoryRouter = require("./routes/invent");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/inv", inventoryRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
