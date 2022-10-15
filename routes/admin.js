var express = require("express");
var router = express.Router();
// const path = require('path')

const productController = require("../server/controller/product-controller");
const userController = require("../server/controller/user-controller");
const categoryController = require("../server/controller/category-controller");
const { upload } = require("../server/middleware/multer");

var productHelper = require("../helpers/product-helpers");
var adminHelper = require("../helpers/admin-helpers");
var userHelper = require("../helpers/user-helpers");

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};



/* GET users listing. */
router.get("/dashboard", function (req, res, next) {
  let admin = req.session.admin;
  console.log(req.session);

  res.render("admin/dashboard", {
    adminAccount: true,
    scrollbar: true,
    // userDetails,
    // products,
    admin,
  });
});

router.get("/admin-login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
});

router.post("/admin-login", (req, res) => {
  adminHelper.doAdminLogin(req.body).then((response) => {
    if (response.adminstatus) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      // console.log(req.session.adminloginErr);
      res.redirect("/admin/dashboard");
    } else {
      req.session.adminloginErr = "Invalid Admin username or password";
      res.redirect("/admin/admin-login");
    }
  });
});

router.get("/admin-logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLogin = false;
  res.redirect("/admin/admin-login");
});

router.get("/view-users", function (req, res, next) {
  let admin = req.session.admin;
  if (req.session.admin) {
    userHelper.getAllUsers().then((userDetails) => {
      res.render("admin/view-users", {
        adminAccount: true,
        scrollbar: true,
        userDetails,
        // products,
        admin,
      });
    });
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
});

//-------------Products--------------

// router.get("/add-products", function (req, res, next) {
//     res.render("admin/add-products", { adminAccount: true, scrollbar: true });
// });

// router.post("/add-products", upload.single('Image'), async (req, res) => {
//   console.log(req.body);

//   console.log(req.files.Image)

//   // let uploadFile = new UploadFile({ img: req.file.filename });
//   productHelper.addProduct(req.body);
//   res.render("admin/add-products", { adminAccount: true, scrollbar: true });
// });

router.get("/view-products", function (req, res, next) {
  let admin = req.session.admin;
  if (req.session.admin) {
    productHelper.getAllProducts().then((products) => {
      res.render("admin/view-products", {
        adminAccount: true,
        scrollbar: true,
        products,
        admin,
      });
    });
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
});

router.get("/add-products", productController.getAddProducts);

router.post(
  "/add-products",
  upload.array("Image"),
  productController.postAddProducts
);

router.get("/delete-product/:id", (req, res) => {
  let productId = req.params.id;
  console.log(productId);
  productHelper.deleteProduct(productId).then(() => {
    res.redirect("/admin/view-products");
  });
});

router.get("/edit-product/:id", productController.getEditProductID); 


router.get("/edit_Product", productController.getEditProduct); 
 

router.post(
  "/edit-product/:id",
  upload.array("Image"),
  productController.postEditProduct
); 

router.get("/block-user/:id", userController.getblockUser );

router.get("/unblock-user/:id", userController.getUnblockUser);


// ---------------------------------------------Categories----------------------------------------------

router.get("/admin-categories", categoryController.getCategory);

module.exports = router;
