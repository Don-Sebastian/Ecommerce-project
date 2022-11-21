const express = require('express');

const router = express.Router();
const productController = require('../server/controller/product-controller');
const adminController = require('../server/controller/admin-controller');
const userController = require('../server/controller/user-controller');
const categoryController = require('../server/controller/category-controller');
const orderController = require('../server/controller/order-controller');
const couponcontroller = require('../server/controller/coupon-controller');
const { upload, upload2 } = require('../server/middleware/multer');

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/admin-login');
  }
};

//= ===================================================
//             ------DASHBOARD, LOGIN------
//= ===================================================

// DASHBOARD CONTENTS
router.get('/dashboard', verifyAdminLogin, adminController.getDashboardAdmin);

// ADMIN LOGIN
router.get('/admin-login', adminController.getAdminLogin);
router.post('/admin-login', adminController.postAdminLogin);

// ADMIN LOGOUT
router.get('/admin-logout', adminController.getAdminLogout);

//= ===================================================
//       ------USERS, PRODUCTS, CATEGORIES------
//= ===================================================

router.get('/view-users', verifyAdminLogin, userController.getAdminViewUsers);

// BLOCK USER
router.get('/block-user/:id', userController.getblockUser);
router.get('/unblock-user/:id', userController.getUnblockUser);

// VIEW PRODUCTS
router.get('/view-products', verifyAdminLogin, productController.getAdminViewProducts);

// ADD PRODUCTS
router.get('/add-products', verifyAdminLogin, productController.getAddProductsAdmin);
router.post('/add-products', verifyAdminLogin, upload.array('Image'), productController.postAddProductsAdmin);
router.post('/category-subcategory', categoryController.postCategorySubcategory);

// EDIT PRODUCTS
router.get('/edit-product/:id', verifyAdminLogin, productController.getEditProductID);
router.get('/edit_Product', verifyAdminLogin, productController.getEditProduct);
router.post('/edit-product/:id', upload.array('Image'), productController.postEditProduct);

// DELETE PRODUCT
router.get('/delete-product/:id', productController.getDeleteProduct);

// VIEW CATEGORY
router.get('/admin-categories', verifyAdminLogin, categoryController.getCategory);

// ADD CATEGORY
router.post('/add-category', verifyAdminLogin, upload2.array('CategoryImage'), categoryController.postAddCategory);

// EDIT CATEGORY
router.get('/edit-category/:id', verifyAdminLogin, categoryController.getEditCategoryID);
router.get('/edit_Category', verifyAdminLogin, categoryController.getEditCategory);
router.post('/edit-category/:id', verifyAdminLogin, upload2.array('CategoryImage'), categoryController.postEditCategory);
router.post('/remove-image-category', categoryController.removeImageCategory);

// DELETE CATEGORY
router.get('/delete-category/:id', verifyAdminLogin, categoryController.getDeleteCategory);

// VIEW SUBCATEGORY
router.get('/admin-sub-categories', verifyAdminLogin, categoryController.getSubCategory);

// ADD SUBCATEGORY
router.post('/add-sub-category', verifyAdminLogin, categoryController.postAddSubCategory);

// EDIT SUBCATEGORY
router.get('/edit-sub-category/:id', verifyAdminLogin, categoryController.getEditSubCategoryID);
router.get('/edit_sub_category', verifyAdminLogin, categoryController.getEditSubCategory);
router.post('/edit-sub-category/:id', verifyAdminLogin, categoryController.postEditSubCategory);

// DELETE SUBCATEGORY
router.get('/delete-sub-category/:id', verifyAdminLogin, categoryController.getDeleteSubCategory);

//= ===================================================
//            ------ORDERS & COUPON------
//= ===================================================

router.get('/admin-orders', verifyAdminLogin, orderController.getAdminViewOrders);
router.post('/update-orderStatus', verifyAdminLogin, orderController.postUpdateOrderStatus);

// VIEW ORDER PRODUCTS
router.get('/view-AdminProductOrder/:id', orderController.getAdminProductOrderID);
router.get('/view-order-products-admin', verifyAdminLogin, orderController.getAdminOrderProducts);
router.post('/update-product-order-status', verifyAdminLogin, orderController.postAdminOrderProducts);

router.get('/admin-coupons', verifyAdminLogin, couponcontroller.getAdminCoupon);

// VIEW, ADD COUPON
router.get('/admin-coupons', verifyAdminLogin, couponcontroller.getAdminCoupon);
router.post('/add-coupon', verifyAdminLogin, couponcontroller.postAddCoupon);

// EDIT COUPON
router.get('/edit_coupon/:id', verifyAdminLogin, couponcontroller.getEditCouponID);
router.get('/edit-coupon', verifyAdminLogin, couponcontroller.getEditCoupon);
router.post('/edit-coupon/:id', verifyAdminLogin, couponcontroller.postEditCoupon);

// DELETE COUPON
router.get('/delete-coupon/:id', verifyAdminLogin, couponcontroller.getDeleteCoupon);

module.exports = router;
