/* eslint-disable no-undef */
/* eslint-disable import/order */
const userHelper = require('../../helpers/user-helpers');
// const process.env = require('../../config/process.env');

const client = require('twilio')(process.env.accountSID, process.env.authToken);

// eslint-disable-next-line no-empty-pattern
const { } = require('../middleware/multer');

exports.getUserSignUp = (req, res) => {
  if (req.query.ReferalCode) {
    res.render('users/user-signup', {
      adminAccount: false,
      navbar: false,
      footer: false,
      userExist: false,
      invalidReferalCode: false,
      referalCode: req.query.ReferalCode,
    });
  } else if (req.session.userLoggedIn) {
    res.redirect('/');
  } else {
    res.render('users/user-signup', {
      adminAccount: false,
      navbar: false,
      footer: false,
      userExist: false,
      invalidReferalCode: false,
      referalCode: false,
    });
  }
};

exports.postUserSignUp = (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    invalidReferalCode = response.invalidReferalCode;
    userExist = response.userExist;
    req.session.user = response;
    req.session.userLoggedIn = false;
    if (userExist) {
      res.render('users/user-signup', {
        adminAccount: false,
        userExist,
        invalidReferalCode,
        navbar: false,
        footer: false,
      });
    } else {
      res.redirect('/login');
    }
  });
};

exports.getUserLogin = (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect('/');
  } else {
    res.render('users/user-login', {
      adminAccount: false,
      loginErr: req.session.userloginErr,
      navbar: false,
      footer: false,
    });
    req.session.userloginErr = false;
  }
};

exports.postUserLogin = (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      user = req.session.user;
      req.session.userLoggedIn = true;
      if (req.session.historyUrl) {
        res.redirect(req.session.historyUrl);
      } else {
        res.redirect('/');
      }
    } else {
      req.session.userloginErr = response.loginErr;
      res.redirect('/login');
    }
  });
};

exports.getUserLogout = (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect('/');
};

exports.getOTPLogin = (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect('/');
  } else {
    res.render('users/otp-request', {
      adminAccount: false,
      loginErr: req.session.userloginErr,
      navbar: false,
      footer: false,
    });
    req.session.userloginErr = false;
  }
};

exports.postOTPLogin = (req, res) => {
  req.session.Mobile = req.body.phonenumber;
  Mob = req.session.Mobile;
  userHelper.OTPLogin(req.body).then((response) => {
    if (response.status) {
      client.verify
        .services(process.env.serviceID)
        .verifications.create({
          to: `+91${Mob}`,
          channel: 'sms',
        })
        .then(() => {
          res.redirect('/verifyOTP');
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    } else {
      req.session.userloginErr = response.loginErr;
      res.redirect('/loginOTP');
    }
  });
};

exports.getOTPVerify = (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect('/');
  } else {
    res.render('users/otp-verify', {
      adminAccount: false,
      loginErr: req.session.userloginErr,
      navbar: false,
      footer: false,
    });
    req.session.userloginErr = false;
  }
};

exports.postOTPVerify = (req, res) => {
  const { code } = req.body;
  const Mob = req.session.Mobile;

  userHelper.OTPVerify(Mob).then((response) => {
    if (response.status) {
      client.verify
        .services(process.env.serviceID)
        // eslint-disable-next-line object-shorthand
        .verificationChecks.create({ to: `+91${Mob}`, code: code })
        .then((result) => {
          if (result.valid) {
            req.session.user = response.user;
            user = req.session.user;
            req.session.userLoggedIn = true;
            res.redirect('/');
          } else {
            req.session.userloginErr = 'Invalid OTP';
            res.redirect('/verifyOTP');
          }
        });
    } else {
      req.session.userloginErr = response.loginErr;
      res.redirect('/loginOTP');
    }
  });
};

exports.getAdminViewUsers = (req, res) => {
  userHelper.getAllUsers().then((userDetails) => {
    adminAccount = true;
    scrollbar = true;
    res.render('admin/view-users', {
      adminAccount,
      scrollbar,
      userDetails,
      admin,
    });
  });
};

exports.getblockUser = (req, res) => {
  const userId = req.params.id;
  userHelper.blockUser(userId).then(() => {
    res.redirect('/admin/view-users');
  });
};

exports.getUnblockUser = (req, res) => {
  const userId = req.params.id;
  userHelper.unblockUser(userId).then(() => {
    res.redirect('/admin/view-users');
  });
};

exports.postAddAddress = (req, res) => {
  userHelper.addAddress(req.body).then(() => {
    res.redirect('/checkout');
  });
};
