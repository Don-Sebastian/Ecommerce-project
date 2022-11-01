var orderHelper = require("../../helpers/order-helpers");
const { response } = require("express");
const userHelpers = require("../../helpers/user-helpers");

exports.getProfileDetails = (async(req, res) => {
  let userDetails = await userHelpers.getUserDetails(req.session.user._id)
  let allUserOrders = await orderHelper.getUserOrders(req.session.user._id)
  console.log(allUserOrders);
    res.render("users/profile", {
      adminAccount: false,
      navbar: true,
      cartCount, allUserOrders
    });
});