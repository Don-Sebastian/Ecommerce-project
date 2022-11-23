const adminHelper = require('../../helpers/admin-helpers');
const orderhelpers = require('../../helpers/order-helpers');

exports.getDashboardAdmin = async (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const admin = req.session.admin;
  const totalSales = await orderhelpers.totalSales();
  const totalPaymentMethod = await orderhelpers.totalPaymentMethod();
  const noOfSales = await orderhelpers.noOfSales();
  const monthlySales = await orderhelpers.monthlySales();
  // eslint-disable-next-line no-unused-vars
  const salesEachMonthSales = await orderhelpers.salesEachMonthSales();
  const lastDateSales = await orderhelpers.lastDateSales();
  const weeklySales = await orderhelpers.weeklySales();
  const yearlySales = await orderhelpers.yearlySales();
  res.render('admin/dashboard', {
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

exports.getAdminLogin = (req, res) => {
  res.render('admin/admin-login', {
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
      // eslint-disable-next-line no-undef
      admin = req.session.admin;
      req.session.adminLoggedIn = true;
      res.redirect('/admin/dashboard');
    } else {
      req.session.adminloginErr = response.adminloginErr;
      res.redirect('/admin/admin-login');
    }
  });
};

exports.getAdminLogout = (req, res) => {
  req.session.admin = null;
  req.session.adminLogin = false;
  res.redirect('/admin/admin-login');
};

exports.getSalesReport = (req, res) => {
  res.render('admin/sales-report', {
    adminAccount: true,
    scrollbar: true,
    // eslint-disable-next-line no-undef
    admin,
  });
};

exports.postDailySalesReport = (req, res) => {
  orderhelpers.dailySales(req.body).then((response) => {
    const orders = response;
    res.render('admin/report-details', {
      adminAccount: true,
      scrollbar: true,
      // eslint-disable-next-line no-undef
      admin,
      orders,
    });
  });
};

exports.postMonthlySalesReport = (req, res) => {
  orderhelpers.monthlySalesReport(req.body).then((response) => {
    const orders = response;
    res.render('admin/report-details', {
      adminAccount: true,
      scrollbar: true,
      // eslint-disable-next-line no-undef
      admin,
      orders,
    });
  });
};

exports.postYearlySalesReport = (req, res) => {
  orderhelpers.yearlySalesReport(req.body).then((response) => {
    const orders = response;
    res.render('admin/report-details', {
      adminAccount: true,
      scrollbar: true,
      // eslint-disable-next-line no-undef
      admin,
      orders,
    });
  });
};
