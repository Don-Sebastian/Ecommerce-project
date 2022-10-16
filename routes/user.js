var express = require('express');
var router = express.Router();

const userController = require("../server/controller/user-controller");
const productController = require("../server/controller/product-controller");
const categoryController = require("../server/controller/category-controller");



const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/");
  }
};



// ___________________Home Page__________________________

router.get("/", productController.getAllProductsAndCategory);


// ......................................................SignUp & Login...............................................

// ___________________User SignUp________________________

router.get("/signup", userController.getUserSignUp);

router.post("/signup", userController.postUserSignUp);


// ___________________User Login__________________________
  
router.get("/login", userController.getUserLogin);

router.post("/login", userController.postUserLogin);

// ___________________User Logout__________________________

router.get("/logout", userController.getUserLogout);




// ........................................................OTP Verifification...............................................

// ___________________OTP Login____________________________

router.get("/loginOTP", userController.getOTPLogin);

router.post("/loginOTP", userController.postOTPLogin);


// ___________________OTP Verify____________________________

router.get("/verifyOTP", userController.getOTPVerify);

router.post("/verifyOTP", userController.postOTPVerify);



// ----------------------------------Product Details--------------------------------------------

router.get("/product-detailID/:id", productController.getProductDetailID);

router.get(
  "/product-details",
  verifyLogin,
  productController.getProductDetails
);


// ----------------------------------Get Category Details------------------------------------------

router.get(
  "/get-categoryID/:id",
  verifyLogin,
  categoryController.getUserCategoryDetailID
);

router.get(
  "/get-CategoryProducts",
  verifyLogin,
  categoryController.getUserCategoryDetail
);


module.exports = router;
