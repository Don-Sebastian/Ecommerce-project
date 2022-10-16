var adminHelper = require("../../helpers/admin-helpers");

exports.getDashboardAdmin = (req, res, next) => {
  let admin = req.session.admin;
  res.render("admin/dashboard", {
    adminAccount: true,
    scrollbar: true,
    // userDetails,
    // products,
    admin,
  });
};

// ................Admin Login....................

exports.getAdminLogin = (req, res) => {
  res.render("admin/admin-login", {
    adminAccount: true,
    adminloginErr: req.session.adminloginErr,
    scrollbar: false,
  });
  req.session.adminloginErr = false;
};

exports.postAdminLogin = (req, res) => {
  adminHelper.doAdminLogin(req.body).then((response) => {
    if (response.adminstatus) {
        req.session.admin = response.admin;
        admin = req.session.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin/dashboard");
    } else {
      req.session.adminloginErr = response.adminloginErr;
      res.redirect("/admin/admin-login");
    }
  });
};

exports.getAdminLogout = (req, res) => {
  req.session.admin = null;
  req.session.adminLogin = false;
  res.redirect("/admin/admin-login");
}; 