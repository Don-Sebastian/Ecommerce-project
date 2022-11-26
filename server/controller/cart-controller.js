/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const { response } = require('express');
const userHelper = require('../../helpers/user-helpers');
const cartHelper = require('../../helpers/cart-helpers');
const wishlistHelpers = require('../../helpers/wishlist-helpers');

let id;
let userID;

exports.getAddToCartID = async (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const user = req.session.user;
  // eslint-disable-next-line no-undef
  let cartCount = null;
  if (user) {
    id = req.params.id;
    // eslint-disable-next-line no-underscore-dangle
    userID = req.session.user._id;
    // eslint-disable-next-line no-unused-vars
    cartCount = await cartHelper.getCartCount(userID);

    const productInCart = await cartHelper.checkProductInCart(id, userID);
    if (productInCart.length !== 0) {
      response.status = true;
      response.statusInCart = true;
      res.json(response);
    } else {
      cartHelper.addToCart(id, userID).then(async () => {
        const wishlistProduct = await wishlistHelpers.checkProductWishlist(id, userID);
        if (wishlistProduct.length !== 0) {
          await wishlistHelpers
            .deleteProductWishlist(id, userID)
            // eslint-disable-next-line no-shadow
            .then((response) => {
              response.status = true;
              res.json(response);
            });
        } else {
          res.json({ status: true });
        }
      });
    }
  } else {
    res.json({ status: false });
  }
};

exports.getCartItems = async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle, no-shadow
  const userID = req.session.user._id;
  const products = await cartHelper.getCartProducts(userID);
  if (products.length === 0) {
    // eslint-disable-next-line no-undef
    totalValue = false;
  } else {
    // eslint-disable-next-line no-undef
    totalValue = await cartHelper.getTotalAmount(userID, req.session.couponOffer);
  }
  const totalAmountProduct = await cartHelper.getTotalAmountProduct(userID);
  if (totalAmountProduct) {
    res.render('users/view-cart', {
      adminAccount: false,
      navbar: true,
      footer: true,
      products,
      // eslint-disable-next-line no-undef
      cartCount,
      // eslint-disable-next-line no-undef
      totalValue,
      totalAmountProduct,
    });
  } else {
    res.render('users/404-page', {
      adminAccount: false,
      navbar: false,
      footer: false,
      user: false,
      error,
    });
  }
};

exports.postChangeProductQuantity = (req, res) => {
  // eslint-disable-next-line no-shadow
  cartHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await cartHelper.getTotalAmount(req.body.user, req.session.couponOffer);
    response.totalAmountProduct = await cartHelper.getTotalAmountProduct(req.body.user);
    res.json(response);
  });
};

// eslint-disable-next-line no-unused-vars
exports.getChangeProductQuantity = (req, res) => {
  id = req.params._id;
  userID = req.session.user._id;
  cartHelper.getProductQuantity(id, userID).then(() => {
  });
};

exports.postRemoveProductFromCart = async (req, res) => {
  const totalAmountProduct = await cartHelper.getTotalAmountProduct(req.session.user._id);
  const count = totalAmountProduct.length;
  // eslint-disable-next-line no-shadow
  await cartHelper.removeProductFromCart(req.body, count).then((response) => {
    res.json(response);
  });
};

exports.getCheckOut = async (req, res) => {
  const total = await cartHelper.getTotalAmount(req.session.user._id, req.session.couponOffer);
  userHelper.getAddress(req.session.user._id).then((address) => {
    res.render('users/checkout-address', {
      adminAccount: false,
      navbar: true,
      footer: true,
      // eslint-disable-next-line no-undef
      products,
      cartCount,
      total,
      address,
    });
  });
};
