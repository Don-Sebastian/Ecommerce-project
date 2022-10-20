var userHelper = require("../../helpers/user-helpers");
var productHelper = require("../../helpers/product-helpers");
const otpConfig = require("../../config/otpConfig");


const client = require("twilio")(otpConfig.accountSID, otpConfig.authToken);

const {} = require("../middleware/multer");

const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

var id;




// ..........................User SignUp......................

exports.getUserSignUp = (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/user-signup", { adminAccount: false, navbar: false });
  }
};

exports.postUserSignUp = (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    userExist = response.userExist;
    req.session.user = response;
    req.session.userLoggedIn = false;
    if (userExist) {
      res.render("users/user-signup", {
        adminAccount: false,
        userExist,
        navbar: false,
      });
    } else {
      res.redirect("/login");
    }
  });
};



// ..........................User Login.......................

exports.getUserLogin = (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/user-login", {
      adminAccount: false,
      loginErr: req.session.userloginErr,
      navbar: false,
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
      res.redirect("/");
    } else {
      req.session.userloginErr = response.loginErr;
      res.redirect("/login");
    }
  })
};

// ..........................User Logout.......................

exports.getUserLogout = (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
};



// _______________________________________________OTP VERIFICATION________________________________________

// .........................OTP Login.........................

exports.getOTPLogin = (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/otp-request", {adminAccount: false,
      loginErr: req.session.userloginErr,
      navbar: false,
    });
    req.session.userloginErr = false;
    // req.session.verifyOTP = false;
  }
};

exports.postOTPLogin = (req, res) => {
  req.session.Mobile = req.body.phonenumber;
  Mob = req.session.Mobile;
  userHelper.OTPLogin(req.body).then((response) => {
    if (response.status) {
      client.verify
        .services(otpConfig.serviceID)
        .verifications.create({
          to: `+91${Mob}`,
          channel: "sms",
        })
        .then(() => {
          // req.session.user = response.user;
          // user = req.session.user;
          res.redirect("/verifyOTP");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      req.session.userloginErr = response.loginErr;
      res.redirect("/loginOTP");
    }
  });
};


// .........................OTP Verify.........................

exports.getOTPVerify = (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/otp-verify", {adminAccount:false,
      loginErr: req.session.userloginErr,
      navbar: false,
    });
    req.session.userloginErr = false;
    // req.session.verifyOTP = false;
  }
};

exports.postOTPVerify = (req, res) => {
  const { code } = req.body;
  const Mob = req.session.Mobile;

  userHelper.OTPVerify(Mob).then((response) => {
    if (response.status) {
      client.verify
        .services(otpConfig.serviceID)
        .verificationChecks.create({ to: `+91${Mob}`, code: code })
        .then((result) => {
          if (result.valid) {
            req.session.user = response.user;
            user = req.session.user;
            req.session.userLoggedIn = true;
            res.redirect("/");
          } else {
            req.session.userloginErr = "Invalid OTP";
            res.redirect("/verifyOTP");
          }
        });
    } else {
      req.session.userloginErr = response.loginErr;
      res.redirect("/loginOTP");
    }
   });
};


// _______________________________________________View & Block User By Admin________________________________________


exports.getAdminViewUsers =  (req, res, next) => {
  userHelper.getAllUsers().then((userDetails) => {
    adminAccount = true;
    scrollbar = true;
      res.render("admin/view-users", {
        adminAccount,
        scrollbar,
        userDetails,
        // products,
        admin,
      });
    });
};

exports.getblockUser = (req, res) => {
  let userId = req.params.id;
  console.log(userId);
  userHelper.blockUser(userId).then(() => {
    res.redirect("/admin/view-users");
  });
};

exports.getUnblockUser = (req, res) => {
  let userId = req.params.id;
  console.log(userId);
  userHelper.unblockUser(userId).then(() => {
    res.redirect("/admin/view-users");
  });
};




  


