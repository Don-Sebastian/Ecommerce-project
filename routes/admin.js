var express = require("express");
var router = express.Router();
// const path = require('path')

const productController = require("../server/controller/product-controller");
const adminController = require("../server/controller/admin-controller");
const userController = require("../server/controller/user-controller");
const categoryController = require("../server/controller/category-controller");
const { upload, upload2 } = require("../server/middleware/multer");



const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/admin-login");
  }
};


// _____________________Admin Dashboard_______________________

/* GET users listing. */
router.get("/dashboard",verifyAdminLogin, adminController.getDashboardAdmin );




// --------------------------------------------Admin Login-------------------------------------------------------


router.get("/admin-login", adminController.getAdminLogin);

router.post("/admin-login", adminController.postAdminLogin);

// _____________________Admin logout__________________________

router.get("/admin-logout", adminController.getAdminLogout);




// --------------------------------------------Admin  Users ---------------------------------------------------

router.get("/view-users", verifyAdminLogin, userController.getAdminViewUsers);

// _____________________Block User__________________________

router.get("/block-user/:id", userController.getblockUser);

router.get("/unblock-user/:id", userController.getUnblockUser);



// --------------------------------------------Admin  Products ---------------------------------------------------

// _____________________View Products__________________________

router.get("/view-products", verifyAdminLogin, productController.getAdminViewProducts);

// _____________________Add Products__________________________

router.get("/add-products", verifyAdminLogin, productController.getAddProductsAdmin);

router.post( "/add-products", verifyAdminLogin, upload.array("Image"), productController.postAddProductsAdmin);

// _____________________Edit Product__________________________

router.get(
  "/edit-product/:id",
  verifyAdminLogin,
  productController.getEditProductID
);

router.get("/edit_Product", verifyAdminLogin, productController.getEditProduct); 

router.post(
  "/edit-product/:id", 
  upload.array("Image"),
  productController.postEditProduct
); 

// _____________________Delete Product__________________________

router.get("/delete-product/:id", productController.getDeleteProduct);



// ---------------------------------------------Admin Categories----------------------------------------------

//___________________View Category_____________________________
router.get(
  "/admin-categories",
  verifyAdminLogin,
  categoryController.getCategory
);

//___________________Add Category_____________________________

router.post(
  "/add-category",
  verifyAdminLogin,
  upload2.array("CategoryImage"),
  categoryController.postAddCategory
);

//___________________Edit Category_____________________________

router.get(
  "/edit-category/:id",
  verifyAdminLogin,
  categoryController.getEditCategoryID
);

router.get(
  "/edit_Category",
  verifyAdminLogin,
  categoryController.getEditCategory
);

router.put(
  "/edit-category/:id",
  verifyAdminLogin,
  upload2.array("CategoryImage"),
  categoryController.postEditCategory
); 

//___________________Delete Category_____________________________

router.get(
  "/delete-category/:id",
  verifyAdminLogin,
  categoryController.getDeleteCategory
);

module.exports = router;
