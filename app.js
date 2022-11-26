require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const db = require('./config/connection');
// const connect = require("./config/connection");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', './layout/layout');
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
  );
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(fileUpload());
app.use(session({ secret: 'key', cookie: { maxAge: 600000 } }));

db.connect((err) => {
  if (err) console.log(`Connection Error${err}`); // eslint-disable-line no-console
  else console.log('Database connected to port 27017'); // eslint-disable-line no-console
});
// require("./config/connection")();

if (app.use('/', userRouter)) {
  app.use(express.static(path.join(__dirname, 'public/user')));
}

if (app.use('/admin', adminRouter)) {
  app.use(express.static(path.join(__dirname, 'public/admin')));
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
