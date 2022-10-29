var userHelper = require("../../helpers/user-helpers");
var cartHelper = require("../../helpers/cart-helpers");
const { response } = require("express");

var id, userID;

exports.getAddToCartID = (req, res) => {
  id = req.params.id;
  userID = req.session.user._id;
      cartHelper.addToCart(id, userID).then(() => {
          res.json({status: true})
    })
  // res.redirect('/add-to-cart');
};

// exports.getAddToCart = (req, res) => {
//     console.log("api call");
//     userHelper.addToCart(id, userID).then(() => {
//         res.json({status: true})
//   })
// };

exports.getCartItems =async (req, res) => { 
  let products = await cartHelper.getCartProducts(req.session.user._id)
  let totalValue = await cartHelper.getTotalAmount(req.session.user._id)
  let totalAmountProduct = await cartHelper.getTotalAmountProduct(req.session.user._id);
  console.log("///////////////////////////");
  console.log(totalAmountProduct);
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
    response.total = await cartHelper.getTotalAmount(req.body.user)
    response.totalAmountProduct = await cartHelper.getTotalAmountProduct(req.body.user);
    console.log("+++++++++++++++++++++++++");
    console.log(response);
    res.json(response)
  });
};


exports.getChangeProductQuantity = (req, res, next) => {
  id = req.params._id;
  userID = req.session.user._id;
  cartHelper.getProductQuantity(id, userID).then(() => {

  })
}

exports.postRemoveProductFromCart = (req, res, next) => {
  cartHelper.removeProductFromCart(req.body).then((response) => {
    console.log(response.productId);
    res.json(response)
  })
};



//===============================================
//              Total Amount
//===============================================

exports.getCheckOut =async (req, res) => {
  let total = await cartHelper.getTotalAmount(req.session.user._id)
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