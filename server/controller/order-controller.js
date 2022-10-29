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
    
};
