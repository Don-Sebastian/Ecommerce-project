const express = require('express');

const router = express.Router();
const userController = require('../server/controller/user-controller');
const productController = require('../server/controller/product-controller');
const categoryController = require('../server/controller/category-controller');
const cartController = require('../server/controller/cart-controller');
const orderController = require('../server/controller/order-controller');
const profileController = require('../server/controller/profile-controller');
const couponController = require('../server/controller/coupon-controller');
const wishlistController = require('../server/controller/wishlist-controller');

const cartHelper = require('../helpers/cart-helpers');
const wishlistHelper = require('../helpers/wishlist-helpers');

const verifyLogin = async (req, res, next) => {
  if (req.session.userLoggedIn) {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.session.user._id;
    req.session.cartCount = await cartHelper.getCartCount(userId);
    req.session.wishlistCount = await wishlistHelper.getWishlistCount(userId);
    // eslint-disable-next-line prefer-destructuring, no-unused-vars
    const cartCount = req.session.cartCount;
    // eslint-disable-next-line prefer-destructuring, no-unused-vars
    const wishlistCount = req.session.wishlistCount;
    req.session.historyUrl = req.originalUrl;
    next();
  } else {
    res.redirect('/');
  }
};

//= ===================================================
//       ------HOME, LOGIN, SIGNUP, OTP------
//= ===================================================

router.get('/', productController.getAllProductsAndCategory);

// USER SIGNUP
router.get('/signup', userController.getUserSignUp);
router.post('/signup', userController.postUserSignUp);

// USER LOGIN
router.get('/login', userController.getUserLogin);
router.post('/login', userController.postUserLogin);

// USER LOGOUT
router.get('/logout', userController.getUserLogout);

// OTP LOGIN
router.get('/loginOTP', userController.getOTPLogin);
router.post('/loginOTP', userController.postOTPLogin);

// OTP VERIFY
router.get('/verifyOTP', userController.getOTPVerify);
router.post('/verifyOTP', userController.postOTPVerify);

//= ===================================================
//   ------PRODUCT, CATEGORY, CART, WISHLIST------
//= ===================================================

// PRODUCT DETAILS
router.get('/product-detailID/:id', productController.getProductDetailID);
router.get('/product-details', productController.getProductDetails);

// CATEGORY DETAILS
router.get('/get-categoryID/:id', categoryController.getUserCategoryDetailID);
router.get('/categoryProducts', categoryController.getUserCategoryDetail);

// ADD TO CART
router.get('/add-to-cartID/:id', cartController.getAddToCartID);
router.get('/cart', verifyLogin, cartController.getCartItems);
router.post('/change-product-quantity', cartController.postChangeProductQuantity);
router.post('/delete-from-cart', cartController.postRemoveProductFromCart);

// ADD REMOVE TO WISHLIST
router.get('/add-to-wishlist/:id', wishlistController.getAddToWishlistID);

// VIEW WISHLIST
router.get('/wishlist', verifyLogin, wishlistController.getWishlist);

//= ===================================================
//       ------CHECKOUT, ORDER DETAILS------
//= ===================================================

router.get('/checkout', verifyLogin, cartController.getCheckOut);
router.post('/place-order', verifyLogin, orderController.getPaymentMethod);

// ADD ADDRESS
router.post('/add-address', userController.postAddAddress);

// PAYMENT VERIFICATION
router.post('/verify-payment', orderController.postVerifyPayment);
router.get('/success', orderController.getSuccessPaypal);
router.get('/cancel', orderController.getCancelPaypal);

// ORDER PROCESS
router.get('/order-success', verifyLogin, orderController.getOrderSuccess);
router.get('/orders', verifyLogin, orderController.getOrderDetails);

router.get('/view-Order-Product/:id', verifyLogin, orderController.getViewOrderProductsID);

router.get('/view-order-products', verifyLogin, orderController.getViewOrderProducts);

//= ===================================================
//               ------PROFILE------
//= ===================================================

// PROFILE PAGE
router.get('/profile', verifyLogin, profileController.getProfileDetails);

// RESET PASSWORD
router.post('/reset-profile-password', verifyLogin, profileController.postResetPassword);

// EDIT ADDRESS
router.get('/edit-Address/:id', profileController.getEditAddressID);
router.get('/edit-address', verifyLogin, profileController.getEditAddress);

// DELETE ADDRESS
router.post('/delete-address/:id', verifyLogin, profileController.postDeleteAddress);

// UPDATE PRODUCT ORDER STATUS
router.post('/update-OrderStatus', orderController.postUpdateProductOrderStatus);

//= ===================================================
//               ------COUPON------
//= ===================================================
router.post('/apply-coupon', verifyLogin, couponController.postApplyCoupon);

module.exports = router;
