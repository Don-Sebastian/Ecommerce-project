var express = require('express');
var router = express.Router();
var userHelper = require("../helpers/user-helpers");
const otpConfig = require("../config/otpConfig");
const userController = require("../server/controller/user-controller");
const productController = require("../server/controller/product-controller");



const client = require("twilio")(otpConfig.accountSID, otpConfig.authToken);



/* GET home page. */
router.get('/', userController.getAllProducts );

// __________________________________________________User SignUp_____________________________________________________________________


router.get("/signup", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/user-signup", { navbar: false });
  }
});

router.post("/signup", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);

    userExist = response.userExist;
    req.session.user = response;
    req.session.userLoggedIn = false;
    if (userExist) {
      res.render("users/user-signup", { userExist, navbar: false });
    } else {
      res.redirect("/login");
    }
  });
});


// ______________________________________________________User Login___________________________________________________________________
  
router.get("/login", (req, res) => {

  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/user-login", { loginErr: req.session.userloginErr ,navbar: false});
    req.session.userloginErr = false;
    
  }
});


router.post("/login", (req, res) => {
  console.log(req.body);

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

  // client.verify
  //   .services(otpConfig.serviceID)
  //   .verifications.create({
  //     to: `+91${req.body.phonenumber}`,
  //     channel: "sms",
  //   })
  //   .then((data) => {
  //     res.render("users/user-verify", { navbar: false }).send(data);
  //     // res.status(200).send(data);
  //     console.log("login OTP");
  //     console.log(data);
  //   });
});


router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});


// _________________________________________________OTP Verifification_________________________________________________________


router.get("/loginOTP", (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {

    res.render("users/otp-request", {
      loginErr: req.session.userloginErr,
      navbar: false,
    });
    // req.session.userloginErr = false;
    // req.session.verifyOTP = false;
  }
});


router.post("/loginOTP", (req, res) => {
  req.session.Mobile = req.body.phonenumber;
  Mob = req.session.Mobile;
  // client.verify
  //   .services(otpConfig.serviceID)
  //   .verifications.create({
  //     to: `+91${req.body.phonenumber}`,
  //     channel: "sms",
  //   })
  //   .then((data) => {
  //     // res.render("users/user-verify", { navbar: false }).send(data);
  //     res.status(200).send(data);
  //     console.log("login OTP");
  //     console.log(data);
  //   });

  userHelper.OTPLogin(req.body).then((response) => {
    if (response.status) {
      client.verify
        .services(otpConfig.serviceID)
        .verifications.create({
          to: `+91${Mob}`,
          channel: "sms",
        })
        .then(() => {
          req.session.user = response.user;
          user = req.session.user;
          res.redirect("/verifyOTP");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      loginErr = response.err;
      res.redirect("/loginOTP");
    }
  });
});


router.get("/verifyOTP", (req, res) => {
  if (req.session.user && req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("users/otp-verify", {
      loginErr: req.session.userloginErr,
      navbar: false,
    });
    // req.session.userloginErr = false;
    // req.session.verifyOTP = false;
  }
});



router.post("/verifyOTP", (req, res) => {
  const { code } = req.body;
  const Mob = req.session.Mobile;

  client.verify
    .services(otpConfig.serviceID)
    .verificationChecks.create({ to: `+91${Mob}`, code: code })
    .then((response) => {
      if (response.valid) {
        req.session.loggedIn = true;
        logged = true;

        res.redirect("/");
      } else {
        req.session.userloginErr = "Invalid OTP";
        res.redirect("/loginOTP");
      }

      // console.log(data.valid);
      //       if (data.valid) {
      //         req.session.verifyOTP = true;
      //         res.redirect("/");
      //       }else {
      //         req.session.verifyOTP = "Incorrect OTP";
      //         res.redirect("/loginOTP");
      //       }
    });
});






// router.post("/verify", (req, res) => {
//   console.log(req.body);

//   client.verify
//     .services(otpConfig.serviceID)
//     .verificationChecks.create({
//       to: `+91${req.body.phonenumber}`,
//       code: req.body.code,
//     })
//     .then((data) => {
      
//       console.log(data.valid);
//       if (data.valid) {
//         req.session.verifyOTP = true;
//         res.redirect("/");
//       }else {
//         req.session.verifyOTP = "Incorrect OTP";
//         res.redirect("/login");
//       }
      
//       // res.status(200).send(data);
//       console.log("verified OTP");
//       console.log(data);
//     });
  
//     // userHelper.doLogin(req.body).then((response) => {
//     //   if (response.status) {
//     //     req.session.user = response.user;
//     //     req.session.userLoggedIn = true;
//     //     res.redirect("/");
//     //   } else {
//     //     req.session.userloginErr = "Invalid username or password";
//     //     res.redirect("/login");
//     //   }
//     // });
  
// });



// ----------------------------------Product Details--------------------------------------------

router.get('/product-detailID/:id', userController.getProductDetailID)

router.get("/product-details", userController.getProductDetails);

module.exports = router;
