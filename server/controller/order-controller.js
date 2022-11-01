var orderHelper = require("../../helpers/order-helpers");
const { response } = require("express");
const cartHelpers = require("../../helpers/cart-helpers");

var id, userID;

exports.getPaymentMethod =async (req, res) => {
    let products = await cartHelpers.getCartProductsList(req.body.user)
    let totalPrice = await cartHelpers.getTotalAmount(req.body.user)
    orderHelper.placeOrder(req.body, products, totalPrice).then((response) => {
        res.json({status: true})
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
    res.redirect("/view-order-product");

};

exports.getViewOrderProducts = async (req, res) => {
    let products = await orderHelper.getOrderProducts(id)
    res.render("users/view-Order-Products", {
      adminAccount: false,
      navbar: true,
      cartCount,
      products,
    });
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
        console.log("+++++++++++++++++++++++++");
        console.log(response);
        res.json(response)
    })
};