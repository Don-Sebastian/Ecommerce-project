var userHelper = require("../../helpers/user-helpers");
var cartHelper = require("../../helpers/cart-helpers");
const { response } = require("express");

var id, userID;

exports.getAddToCartID = async(req, res) => {
  let user = req.session.user;
  cartCount = null;
  if (user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id);
    id = req.params.id;
    userID = req.session.user._id;
    cartHelper.addToCart(id, userID).then(() => {
      res.json({ status: true });
    });
  } else {
    res.json({status:false})
  }
};

exports.getCartItems =async (req, res) => { 
  let products = await cartHelper.getCartProducts(req.session.user._id)
  if (products.length == 0) {
    totalValue = false;
  } else {
    totalValue = await cartHelper.getTotalAmount(req.session.user._id, req.session.couponOffer);
  }
  let totalAmountProduct = await cartHelper.getTotalAmountProduct(req.session.user._id);
    res.render("users/view-cart", {
      adminAccount: false,
      navbar: true,
      products,
      cartCount,
      totalValue,
      totalAmountProduct,
    });
};



exports.postChangeProductQuantity = (req, res, next) => {
  cartHelper.changeProductQuantity(req.body).then(async(response) => {
    response.total = await cartHelper.getTotalAmount(req.body.user, req.session.couponOffer)
    response.totalAmountProduct = await cartHelper.getTotalAmountProduct(req.body.user);
    res.json(response)
  });
};


exports.getChangeProductQuantity = (req, res, next) => {
  id = req.params._id;
  userID = req.session.user._id;
  cartHelper.getProductQuantity(id, userID).then(() => {

  })
}

exports.postRemoveProductFromCart = async(req, res, next) => {
  let totalAmountProduct = await cartHelper.getTotalAmountProduct(req.session.user._id)
  let count = totalAmountProduct.length;
  await cartHelper.removeProductFromCart(req.body, count).then((response) => {
    res.json(response);
  });
};



//===============================================
//              Total Amount
//===============================================

exports.getCheckOut =async (req, res) => {
  let total = await cartHelper.getTotalAmount(req.session.user._id, req.session.couponOffer)
  userHelper.getAddress(req.session.user._id).then((address) => {
    res.render("users/checkout-address", {
      adminAccount: false,
      navbar: true,
      products,
      cartCount,
      total,
      address,
    });
  });
    
};