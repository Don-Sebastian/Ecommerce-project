var productHelper = require("../../helpers/product-helpers");
var cartHelper = require("../../helpers/cart-helpers");
const {  } = require("../middleware/multer");
const fs = require("fs");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const categoryHelpers = require("../../helpers/category-helpers");

var id;
var cartCount

// --------------------------------------------Admin  Products ---------------------------------------------------

// _____________________View Products__________________________

exports.getAdminViewProducts = (req, res, next) => {
      productHelper.getAllProducts().then((products) => {
      res.render("admin/view-products", {
        adminAccount: true,
        scrollbar: true,
        products,
        admin,
      });
    });
  };

// _____________________Add Products__________________________

exports.getAddProductsAdmin = async(req, res) => {
  let category =await categoryHelpers.getCategoryNames();
  res.render("admin/add-products", {
    adminAccount: true,
    scrollbar: true,
    productAdded: false,
  });
};

exports.postAddProductsAdmin = (req, res, next) => {
    const files = req.files;
    const file = files.map((file) => {
      return file;
    });
    const fileName = file.map((file) => {
      return file.filename;
    });
    const product = req.body;
    product.Image = fileName;


    if (!req.files) {
      const error = new Error("Please choose files");
      error.httpStatusCode = 400;
      return next(error);
    }
    
    productHelper.addProduct(req.body)
    res.render("admin/add-products", {
          adminAccount: true,
          scrollbar: true,
          productAdded: true, 
        });
     }

// _____________________Edit Product__________________________

exports.getEditProductID = (req, res) => {
  id = req.params.id 
  res.redirect('/admin/edit_Product')
 
};

exports.getEditProduct = async(req, res) => {
  let product = await productHelper.getProductDetails(id);
  
  res.render("admin/edit_product", {
    adminAccount: true,
    scrollbar: true,
    product
    
  })
};

exports.postEditProduct = (req, res) => {
    const files = req.files;
    const file = files.map((file) => {
      return file;
    });
    const fileName = file.map((file) => {
      return file.filename;
    });
    const productedit = req.body;
    productedit.Image = fileName;


    if (!req.files) {
      const error = new Error("Please choose files");
      error.httpStatusCode = 400;
      return next(error);
    }

    productHelper.updateProductreq(id, productedit).then(() => {
      res.redirect("/admin/view-products");
    });
  
};

// _____________________Delete Product__________________________

exports.getDeleteProduct = (req, res) => {
  let productId = req.params.id;
  
  productHelper.deleteProduct(productId).then(() => {
    fs.unlink("/uploads/category/", (err) => {
      if (err) console.log(err);
      else {
        console.log("\nDeleted file: example_file.txt");
      }
    });
    res.redirect("/admin/view-products");
  });
};





// --------------------------------------Product Details For User ---------------------------------------

// _____________________All Product for user__________________________


exports.getAllProductsAndCategory =async function (req, res, next) {
  let user = req.session.user;
  cartCount = null;
  if (req.session.user) {
    cartCount =await cartHelper.getCartCount(req.session.user._id);
  }
  console.log(cartCount);
  productHelper.getAllProductsAndCategory().then((response) => {
    products = response.products;
    category = response.category;
    res.render("users/home", {
      adminAccount: false,
      title: "Fadonsta",
      navbar: true,
      user,
      products,
      category,
      cartCount,
    });
  });
};

// _____________________ Detail of one Product for user__________________________


exports.getProductDetailID = (req, res) => {
  id = req.params.id;
  res.redirect("/product-details");
};

exports.getProductDetails = (req, res) => {
    
  productHelper.getProductDetails(id).then((product) => {
      res.render("users/product-details", {
        title: "Fadonsta",
        adminAccount: false,
        navbar: true,
        user,
        product,
        cartCount, id,
      });
    });
  
};