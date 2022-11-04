var orderHelper = require("../../helpers/order-helpers");
const { response } = require("express");
const cartHelpers = require("../../helpers/cart-helpers");
const userHelpers = require("../../helpers/user-helpers");

var id, userID;

exports.getPaymentMethod = async (req, res) => {
  let cartItems = await cartHelpers.getCartProductsList(req.body.user)
  let totalPrice = 0;
  if (products.length > 0) {
        totalPrice = await cartHelpers.getTotalAmount(req.body.user);
  }
    orderHelper
      .placeOrder(req.body, cartItems, totalPrice)
      .then(async (orderId) => {
        if (req.body.paymentMethod == "COD") {
          res.json({ codSuccess: true });
        } else {
          await orderHelper
            .generateRazorpay(orderId, totalPrice)
            .then((response) => {
              res.json(response);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
}

exports.getOrderSuccess = (req, res) => {
    res.render("users/order-success", {
      adminAccount: false,
      navbar: true,
      cartCount,
    });
};

exports.getOrderDetails = async(req, res) => {
    let orders = await orderHelper.getUserOrders(req.session.user._id)
    res.render("users/orders", {
      adminAccount: false,
      navbar: true,
        cartCount,
        orders
    });
};

exports.getViewOrderProductsID = (req, res) => {
    id = req.params.id;
    res.redirect("/view-order-products");

};

exports.getViewOrderProducts = async (req, res) => {
  let products = await orderHelper.getOrderProducts(id)
  let order = await orderHelper.orderDetails(id)
    res.render("users/view-Order-Products", {
      adminAccount: false,
      navbar: true,
      cartCount,
      products, order
    });
};

exports.postVerifyPayment = (req, res) => {
    console.log(req.body);
    orderHelper.verifyPayment(req.body).then(() => {
      orderHelper
        .changePaymentStatus(req.body["order[receipt]"])
        .then(() => {
          console.log("Payment Successfull");
          res.json({ status: true });
        })
        .catch((err) => {
          console.log(err);
        });
    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: ""})
    })
};


//=========================================================
//                    Admin Orders
//=========================================================

exports.getAdminViewOrders = async (req, res) => {
    let orders = await orderHelper.getOrdersAdmin()
    res.render("admin/view-orders", {
      adminAccount: true,
      scrollbar: true,
      orders,
      admin,
    });
}

exports.postUpdateOrderStatus = (req, res) => {
    console.log(req.body);
    orderHelper.updateOrderStatus(req.body).then((response) => {
        res.json(response)
    })
};