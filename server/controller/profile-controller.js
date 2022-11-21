/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const orderHelper = require('../../helpers/order-helpers');
const userHelpers = require('../../helpers/user-helpers');

exports.getProfileDetails = (async (req, res) => {
  const userDetails = await userHelpers.getUserDetails(req.session.user._id);
  const allUserOrders = await orderHelper.getUserOrders(req.session.user._id);
  const address = await userHelpers.getAddress(req.session.user._id);
  res.render('users/profile', {
    adminAccount: false,
    navbar: true,
    cartCount,
    allUserOrders,
    userDetails,
    address,
  });
});

exports.postResetPassword = (async (req, res) => {
  userId = req.session.user._id;
  await userHelpers.resetPassword(req.body, userId).then(() => {
    // eslint-disable-next-line no-console
    console.log('success');
    res.json({ status: true });
  });
});

exports.getEditAddressID = (req, res) => {
  id = req.params.id;
  res.redirect('/edit-address');
};

exports.getEditAddress = (req, res) => {
  userHelpers.editAddress(id, req.session.user._id).then((address) => {
    res.render('users/edit-address', {
      adminAccount: false,
      navbar: true,
      address,
      cartCount,
    });
  });
};

exports.postDeleteAddress = (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
};

exports.getOrderID = (req, res) => {
  id = req.params._id;
  res.redirect('/view-order-products');
};
