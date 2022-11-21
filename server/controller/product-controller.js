/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
const fs = require('fs');
// eslint-disable-next-line no-empty-pattern
const { } = require('../middleware/multer');
const cartHelper = require('../../helpers/cart-helpers');
const productHelper = require('../../helpers/product-helpers');
const categoryHelpers = require('../../helpers/category-helpers');
const wishlistHelpers = require('../../helpers/wishlist-helpers');

let id;
let cartCount;

exports.getAdminViewProducts = async (req, res) => {
  await productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', {
      adminAccount: true,
      scrollbar: true,
      products,
      admin,
    });
  });
};

// _____________________Add Products__________________________

exports.getAddProductsAdmin = async (req, res) => {
  const categories = await categoryHelpers.getAllCategories();
  res.render('admin/add-products', {
    adminAccount: true,
    scrollbar: true,
    productAdded: false,
    categories,
  });
};

exports.postAddProductsAdmin = async (req, res, next) => {
  const { files } = req;
  const file = files.map((file) => file);
  const fileName = file.map((file) => file.filename);
  const product = req.body;
  product.Image = fileName;
  if (req.body.productOffer) {
    product.salePrice = (((req.body.productOffer) * (req.body.Price)) / 100);
  }
  product.Date = new Date();
  if (!req.files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }
  await productHelper.addProduct(req.body);
  const categories = await categoryHelpers.getAllCategories();
  res.render('admin/add-products', {
    adminAccount: true,
    scrollbar: true,
    productAdded: true,
    categories,
  });
};

exports.getEditProductID = (req, res) => {
  id = req.params.id;
  res.redirect('/admin/edit_Product');
};

exports.getEditProduct = async (req, res) => {
  const product = await productHelper.getProductDetails(id);
  const categories = await categoryHelpers.getAllCategories();
  res.render('admin/edit_product', {
    adminAccount: true,
    scrollbar: true,
    product,
    categories,
  });
};

exports.postEditProduct = (req, res) => {
  const { files } = req;
  const file = files.map((file) => file);
  const fileName = file.map((file) => file.filename);
  const productedit = req.body;
  productedit.Image = fileName;

  if (!req.files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }
  productHelper.updateProductreq(id, req.body).then(() => {
    res.redirect('/admin/view-products');
  });
};

// _____________________Delete Product__________________________

exports.getDeleteProduct = (req, res) => {
  const productId = req.params.id;
  productHelper.deleteProduct(productId).then((response) => {
    if (response.productDetails.Image[0]) {
      for (let i = 0; i < response.productDetails.Image.length; i++) {
        fs.unlink(`C:/Users/donsw/OneDrive/Desktop/Web Development/web-devolps/1.Project1/Ecommerce-project/public/admin/uploads/${response.productDetails.Image[i]}`, (err) => {
          // eslint-disable-next-line no-console
          if (err) console.log(err);
          else {
            // eslint-disable-next-line no-console
            console.log(`\nDeleted file: ${response.productDetails.Image[i]}`);
          }
        });
      }
    }
    res.json(response);
  });
};

exports.getAllProductsAndCategory = async (req, res) => {
  const { user } = req.session;
  cartCount = null;
  wishlistCount = null;
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id);
    wishlistCount = await wishlistHelpers.getWishlistCount(req.session.user._id);
  }
  productHelper.getAllProductsAndCategory().then((response) => {
    products = response.products;
    category = response.category;
    res.render('users/home', {
      adminAccount: false,
      title: 'Fadonsta',
      navbar: true,
      user,
      products,
      category,
      cartCount,
      wishlistCount,
    });
  });
};

exports.getProductDetailID = (req, res) => {
  id = req.params.id;
  res.redirect('/product-details');
};

exports.getProductDetails = async (req, res) => {
  const { user } = req.session;
  cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id);
  }
  productHelper.getProductDetails(id).then((product) => {
    res.render('users/product-details', {
      title: 'Fadonsta',
      adminAccount: false,
      navbar: true,
      user,
      product,
      cartCount,
      id,
    });
  });
};
