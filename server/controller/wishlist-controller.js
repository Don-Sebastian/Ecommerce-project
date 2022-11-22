/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const wishlistHelper = require('../../helpers/wishlist-helpers');

exports.getAddToWishlistID = async (req, res) => {
  const { user } = req.session;
  if (user) {
    await wishlistHelper.addAndRemoveFromWishlist(req.params.id, req.session.user._id).then(async (response) => {
      const count = await wishlistHelper.getWishlistCount(req.session.user._id);
      response.count = count;
      response.status = true;
      res.json(response);
    });
  }
};

exports.getWishlist = async (req, res) => {
  const products = await wishlistHelper.wishlistProducts(req.session.user._id);
  res.render('users/view-wishlist', {
    adminAccount: false,
    title: 'Fadonsta',
    navbar: true,
    footer: true,
    user,
    products,
    cartCount,
    wishlistCount,
  });
};
