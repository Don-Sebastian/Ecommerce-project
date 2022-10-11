var express = require('express');
var router = express.Router();
var userHelper = require("../helpers/user-helpers");

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;

  res.render("users/home", {
    title: "Fadonsta" ,navbar: true, user
    // , products
  });
});
  
router.get("/login", (req, res) => {

  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/user-login", { loginErr: req.session.userloginErr ,navbar: false});
    req.session.userloginErr = false;
  }
});

router.get("/signup", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/user-signup", { navbar: false});
  }
});


router.post("/signup", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);

    userExist = response.userExist;
    req.session.user = response;
    req.session.userLoggedIn = false;
    if (userExist) {
      res.render("users/user-signup", { userExist ,navbar: false});
    } else {
      res.redirect("/login");
    }
  });
});

router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.userloginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});

module.exports = router;
