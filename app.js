var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
const handlebars = require("handlebars");
var bodyParser = require("body-parser");

var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var hbs = require("express-handlebars");
// var fileUpload = require("express-fileupload");
var db = require("./config/connection");
const e = require("express");
// var connect = require("./config/connection");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialDir: __dirname + "/views/partials",
  })
);


handlebars.registerHelper("inc", (value, options) => {
  return parseInt(value) + 1;
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(fileUpload());
app.use(session({ secret: "key", cookie: { maxAge: 600000 } }));

db.connect((err) => {
  if (err) console.log("Connection Error" + err);
  else console.log("Database connected to port 27017");
});
// require("./config/connection")();



if (app.use("/", userRouter)) {
  app.use(express.static(path.join(__dirname, "public/user")));
};

if (app.use("/admin", adminRouter)) {
  app.use(express.static(path.join(__dirname, "public/admin")));
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
