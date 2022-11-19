var productHelper = require("../../helpers/product-helpers");
var cartHelper = require("../../helpers/cart-helpers");
const {  } = require("../middleware/multer");
const fs = require("fs");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const categoryHelpers = require("../../helpers/category-helpers");
const wishlistHelpers = require("../../helpers/wishlist-helpers");

var id;
var cartCount

// --------------------------------------------Admin  Products ---------------------------------------------------

// _____________________View Products__________________________

exports.getAdminViewProducts = async (req, res, next) => {
  
     await productHelper.getAllProducts().then((products) => {
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
  let categories = await categoryHelpers.getAllCategories();
  res.render("admin/add-products", {
    adminAccount: true,
    scrollbar: true,
    productAdded: false,
    categories,
  });
};

exports.postAddProductsAdmin = async(req, res, next) => {
  const files = req.files;
  const file = files.map((file) => {
    return file;
  });
  const fileName = file.map((file) => {
    return file.filename;
  });
  const product = req.body;
  product.Image = fileName;
  if (req.body.productOffer) {
    product.salePrice = (((req.body.productOffer)*(req.body.Price))/100);
  } 
  product.Date = new Date();


  if (!req.files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }
    
  await productHelper.addProduct(req.body)
  let categories = await categoryHelpers.getAllCategories();
  res.render("admin/add-products", {
    adminAccount: true,
    scrollbar: true,
    productAdded: true,
    categories,
  });
};
     


// _____________________Edit Product__________________________

exports.getEditProductID = (req, res) => {
  id = req.params.id 
  res.redirect('/admin/edit_Product')
 
};

exports.getEditProduct = async(req, res) => {
  let product = await productHelper.getProductDetails(id);
  let categories = await categoryHelpers.getAllCategories();
  console.log("-----------", product);
  res.render("admin/edit_product", {
    adminAccount: true,
    scrollbar: true,
    product,
    categories,
  });
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
  
  console.log(req.body.Image,"..........................");

    productHelper.updateProductreq(id, req.body).then(() => {
      res.redirect("/admin/view-products");
    });
  
};

// _____________________Delete Product__________________________

exports.getDeleteProduct = (req, res) => {
  let productId = req.params.id;
  
  productHelper.deleteProduct(productId).then((response) => {
    if (response.productDetails.Image[0]) {
      for (let i = 0; i < response.productDetails.Image.length; i++) {
        fs.unlink("C:/Users/donsw/OneDrive/Desktop/Web Development/web-devolps/1.Project1/Ecommerce-project/public/admin/uploads/" + response.productDetails.Image[i], (err) => {
          if (err) console.log(err);
          else {
            console.log("\nDeleted file: " + response.productDetails.Image[i]);
          }
        });
      }
    }
    res.json(response);
  });
};





// --------------------------------------Product Details For User ---------------------------------------

// _____________________All Product for user__________________________


exports.getAllProductsAndCategory =async function (req, res, next) {
  let user = req.session.user;
  cartCount = null;
  wishlistCount = null;
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id);
    wishlistCount = await wishlistHelpers.getWishlistCount(req.session.user._id)
  }
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
      wishlistCount,
    });
  });
};

// _____________________ Detail of one Product for user__________________________


exports.getProductDetailID = (req, res) => {
  id = req.params.id;
  res.redirect("/product-details");
};

exports.getProductDetails = async(req, res) => {
  let user = req.session.user;
  cartCount = null;
  if (req.session.user) {
    cartCount =await cartHelper.getCartCount(req.session.user._id);
  }
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