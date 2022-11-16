var adminHelper = require("../../helpers/admin-helpers");
var orderhelpers = require("../../helpers/order-helpers")

exports.getDashboardAdmin = async(req, res, next) => {
  let admin = req.session.admin;
  let totalSales = await orderhelpers.totalSales()
  let totalPaymentMethod = await orderhelpers.totalPaymentMethod()
  let noOfSales = await orderhelpers.noOfSales()
  let monthlySales = await orderhelpers.monthlySales()
  let salesEachMonthSales = await orderhelpers.salesEachMonthSales();
  let lastDateSales = await orderhelpers.lastDateSales()
  let weeklySales = await orderhelpers.weeklySales()
  let yearlySales = await orderhelpers.yearlySales();
  res.render("admin/dashboard", {
    adminAccount: true,
    scrollbar: true,
    admin,
    totalSales,
    totalPaymentMethod,
    noOfSales,
    monthlySales,
    lastDateSales,
    weeklySales,
    yearlySales,
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