var orderHelper = require("../../helpers/order-helpers");
const { response } = require("express");
const userHelpers = require("../../helpers/user-helpers");

exports.getProfileDetails = (async(req, res) => {
  let userDetails = await userHelpers.getUserDetails(req.session.user._id)
  let allUserOrders = await orderHelper.getUserOrders(req.session.user._id)
  let address = await userHelpers.getAddress(req.session.user._id)
    res.render("users/profile", {
      adminAccount: false,
      navbar: true,
      cartCount,
      allUserOrders,
      userDetails,
      address,
    });
});

exports.postResetPassword = (async(req, res) => {
  userId = req.session.user._id;
  await userHelpers.resetPassword(req.body, userId).then((response) => {
    console.log("success");
    res.json({status: true})
  })
});

exports.getEditAddressID = (req, res) => {
  id = req.params.id;
  res.redirect("/edit-address");
};

exports.getEditAddress = (req, res) => {
  userHelpers.editAddress(id, req.session.user._id).then((address) => {
    console.log(address);
    res.render("users/edit-address", {
      adminAccount: false,
      navbar: true,
      address,
      cartCount,
    });
  });
};

exports.postDeleteAddress = (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.user._id).then((response) => {
    res.json({status: true})
  })
};

exports.getOrderID = (req, res) => {
  id = req.params._id;
  res.redirect("/view-order-products")
};

exports.getOrderProducts = (req, res) => {
  orderHelper.orderProducts(id).then(() => {
    
  })
};