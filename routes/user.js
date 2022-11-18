var express = require("express");
var router = express.Router();

const userController = require("../server/controller/user-controller");
const productController = require("../server/controller/product-controller");
const categoryController = require("../server/controller/category-controller");
const cartController = require("../server/controller/cart-controller");
const orderController = require("../server/controller/order-controller");
const profileController = require("../server/controller/profile-controller");
const couponController = require("../server/controller/coupon-controller");
const wishlistController = require("../server/controller/wishlist-controller");

var cartHelper = require("../helpers/cart-helpers");

const verifyLogin = async (req, res, next) => {
  
  if (req.session.userLoggedIn) {
    req.session.cartCount = await cartHelper.getCartCount(req.session.user._id);
    cartCount = req.session.cartCount;
    req.session.historyUrl = req.originalUrl;
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
  productController.getProductDetails
);

// ----------------------------------Get Category Details------------------------------------------

router.get(
  "/get-categoryID/:id",
  categoryController.getUserCategoryDetailID
);

router.get(
  "/categoryProducts",
  categoryController.getUserCategoryDetail
);

// ----------------------------------Cart Details--------------------------------------------

// ___________________Add to Cart____________________________


router.get("/add-to-cartID/:id", cartController.getAddToCartID);

// router.get("/add-to-cart", verifyLogin, cartController.getAddToCart);

router.get("/cart", verifyLogin, cartController.getCartItems);

// router.get(
//   "/change-product-quantity/:id",
//   verifyLogin,
//   cartController.getChangeProductQuantity
// );

router.post(
  "/change-product-quantity",
  cartController.postChangeProductQuantity
);

router.post("/delete-from-cart", cartController.postRemoveProductFromCart);


//=======================================================================================
//                             ------Wishlist------
//=======================================================================================

// ADD TO WISHLIST
router.get("/add-to-wishlist/:id", wishlistController.getAddToWishlistID);


// ----------------------------------Checkout Details--------------------------------------------

// ___________________Order Checkout and Address selection____________________________

router.get("/checkout", verifyLogin, cartController.getCheckOut);

router.post("/place-order", verifyLogin, orderController.getPaymentMethod);

// ___________________Add Address__________________________________

router.post("/add-address", userController.postAddAddress);

// ___________________Payment verification__________________________________

router.post("/verify-payment", orderController.postVerifyPayment);

router.get("/success", orderController.getSuccessPaypal)

router.get("/cancel", orderController.getCancelPaypal);





// ----------------------------------Order Details--------------------------------------------

// ___________________Order process__________________________________

router.get("/order-success", verifyLogin, orderController.getOrderSuccess);

router.get("/orders", verifyLogin, orderController.getOrderDetails);

router.get(
  "/view-Order-Product/:id",
  verifyLogin,
  orderController.getViewOrderProductsID
);

router.get("/view-order-products", verifyLogin, orderController.getViewOrderProducts);


//=======================================================================================
//                             ------Profile------
//=======================================================================================

// PROFILE PAGE
router.get("/profile", verifyLogin, profileController.getProfileDetails);

// RESET PASSWORD
router.post("/reset-profile-password", verifyLogin, profileController.postResetPassword);

// EDIT ADDRESS
router.get("/edit-Address/:id", profileController.getEditAddressID);

router.get("/edit-address", verifyLogin, profileController.getEditAddress);

// DELETE ADDRESS
router.post("/delete-address/:id", verifyLogin, profileController.postDeleteAddress);

// UPDATE PRODUCT ORDER STATUS
router.post(
  "/update-OrderStatus",
  orderController.postUpdateProductOrderStatus
);


//=======================================================================================
//                             ------Coupon------
//=======================================================================================

router.post("/apply-coupon", verifyLogin, couponController.postApplyCoupon);



module.exports = router;
