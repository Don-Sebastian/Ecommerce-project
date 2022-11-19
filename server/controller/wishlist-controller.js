const wishlistHelper = require("../../helpers/wishlist-helpers"); 

exports.getAddToWishlistID = async(req, res) => {
    let user = req.session.user
    if (user) {
        
        await wishlistHelper.addAndRemoveFromWishlist(req.params.id, req.session.user._id).then(async(response) => {
            let count = await wishlistHelper.getWishlistCount(req.session.user._id)
            response.count = count
            response.status = true
            console.log(response);
            res.json(response)
        })
    }
};

exports.getWishlist = async(req, res) => {
    let products = await wishlistHelper.wishlistProducts(req.session.user._id)
    res.render("users/view-wishlist", {
      adminAccount: false,
      title: "Fadonsta",
      navbar: true,
      user,
      products,
      cartCount,
      wishlistCount,
    });
};