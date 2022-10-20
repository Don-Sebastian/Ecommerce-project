var userHelper = require("../../helpers/user-helpers");
var cartHelper = require("../../helpers/cart-helpers");

var id, userID;

exports.getAddToCartID = (req, res) => {
  id = req.params.id;
  userID = req.session.user._id;
      userHelper.addToCart(id, userID).then(() => {
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
    let products = await userHelper.getCartProducts(req.session.user._id)
    console.log(products);
    res.render("users/view-cart", {
        adminAccount: false, navbar: true, products, cartCount});
};



exports.postChangeProductQuantity = (req, res, next) => {
  console.log("==========================================");
  console.log(req.body);
  cartHelper.changeProductQuantity(req.body).then(() => {
    
  })
};
