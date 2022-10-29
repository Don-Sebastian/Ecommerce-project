var express = require('express');
var router = express.Router();

const userController = require("../server/controller/user-controller");
const productController = require("../server/controller/product-controller");
const categoryController = require("../server/controller/category-controller");
const cartController = require("../server/controller/cart-controller");
const orderController = require("../server/controller/order-controller");

var cartHelper = require("../helpers/cart-helpers");


const verifyLogin = async (req, res, next) => {
  if (req.session.userLoggedIn) {
    req.session.cartCount = await cartHelper.getCartCount(req.session.user._id);
    cartCount = req.session.cartCount;
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

router.get("/verifyOTP",userController.getOTPVerify);

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




// ----------------------------------Cart Details--------------------------------------------

// ___________________Add to Cart____________________________

router.get("/add-to-cartID/:id", verifyLogin, cartController.getAddToCartID); 

// router.get("/add-to-cart", verifyLogin, cartController.getAddToCart); 

router.get('/cart', verifyLogin, cartController.getCartItems)

// router.get(
//   "/change-product-quantity/:id",
//   verifyLogin,
//   cartController.getChangeProductQuantity
// ); 

router.post('/change-product-quantity', cartController.postChangeProductQuantity);

router.post("/delete-from-cart", cartController.postRemoveProductFromCart);




// ----------------------------------Checkout Details--------------------------------------------

// ___________________Address selection____________________________

router.get("/checkout", verifyLogin, cartController.getCheckOut);

router.post('/place-order', verifyLogin, orderController.getPaymentMethod)

// ___________________Add Address__________________________________

router.post('/add-address', userController.postAddAddress)



// ----------------------------------Order Details--------------------------------------------

// ___________________Add Address__________________________________

router.get("/order-success", verifyLogin, orderController.getOrderSuccess);




module.exports = router;
