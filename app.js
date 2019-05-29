require("dotenv").config();

/* Database configuration */
const { connector } = require("./database/config/dbConfig");

/* Controllers */
const getHome = require("./controllers/homeController");
const getProfile = require("./controllers/profileController");
const getLogout = require("./controllers/logoutController");
const {
  getRegistrationPage,
  postUserRegistration
} = require("./controllers/registerController");
const {
  getLoginPage,
  postUserLogin
} = require("./controllers/loginController");

/* NPM packages */
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const flash = require("express-flash");

/* Application conf */
const port = process.env.PORT || 3000;
const app = express();

/* Template engine setup */
app.set("view engine", "ejs");

/* Middleware: NPM packages */
app.use(morgan("dev"));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    name: process.env.SESSION_COOKIE,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

/* Custom Middleware */
let isUserLoggedIn = (req, res, next) => {
  if (req.session.user && req.cookies.authCookie) {
    res.redirect("/profile");
  } else {
    next();
  }
};

/* Routes */
app.get("/", isUserLoggedIn, getHome);

app.get("/register", isUserLoggedIn, getRegistrationPage);
app.post("/register", postUserRegistration);

app.get("/login", isUserLoggedIn, getLoginPage);
app.post("/login", postUserLogin);

app.get("/profile", getProfile);

app.get("/logout", getLogout);

/* Start server & Run db */
connector
  .sync()
  .then(() => {
    app.listen(port, () => console.log(`I've got ears on port: ${port}`));
  })
  .catch(error => console.error(`Couldn't sync with database: ${error.stack}`));
