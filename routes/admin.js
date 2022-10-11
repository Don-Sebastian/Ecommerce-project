var express = require('express');
var router = express.Router();
var adminHelper = require("../helpers/admin-helpers");
var userHelper = require("../helpers/user-helpers");


const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET users listing. */
router.get('/dashboard', function (req, res, next) {
  let admin = req.session.admin;
  

  res.render("admin/dashboard", {
    adminAccount: true, scrollbar: true,
    // userDetails,
    // products,
    admin,
  });
});

router.get("/admin-login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
});

router.post("/admin-login", (req, res) => {
  adminHelper.doAdminLogin(req.body).then((response) => {
    if (response.adminstatus) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      // console.log(req.session.adminloginErr);
      res.redirect("/admin/dashboard");
    } else {
      req.session.adminloginErr = "Invalid Admin username or password";
      res.redirect("/admin/admin-login");
    }
  });
});

router.get("/admin-logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLogin = false;
  res.redirect("/admin/admin-login");
});

router.get("/view-users", function (req, res, next) {
  
  userHelper.getAllUsers().then((userDetails) => {
      res.render("admin/view-users", {
      adminAccount: true,
      scrollbar: true,
      userDetails,
      // products,
      // admin,
    });
  })
  
});

router.get("/add-products", function (req, res, next) {
    res.render("admin/add-products", { adminAccount: true, scrollbar: true });
});


module.exports = router;