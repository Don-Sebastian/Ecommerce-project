const cartHelpers = require("../../helpers/cart-helpers");
var couponHelper = require("../../helpers/coupon-helpers");

var id;

exports.getAdminCoupon = (req, res) => {
    couponAdded = req.session.couponAdded;
    req.session.couponAdded = false;
    couponHelper.couponAdmin().then((coupons) => {
        res.render("admin/view-coupons", {
          adminAccount: true,
          scrollbar: true,
          admin,
          couponAdded,
            coupons,
        });
    })
};

exports.postAddCoupon = (req, res) => {
    couponHelper.addCoupon(req.body).then(() => {
        req.session.couponAdded = true;
        res.redirect("/admin/admin-coupons");
    })
};

exports.getEditCouponID = (req, res) => {
  id = req.params.id;
  res.redirect("/admin/edit-coupon");
};

exports.getEditCoupon = async (req, res) => {
  let coupon = await couponHelper.getCouponDetails(id);
  res.render("admin/edit-coupon", {
    adminAccount: true,
    scrollbar: true,
    coupon,
  });
};

exports.postEditCoupon = (req, res) => {
    couponHelper.updateCoupon(id, req.body).then(() => {
      res.redirect("/admin/admin-coupons");
    });
}

exports.getDeleteCoupon = (req, res) => {
    couponHelper.deleteCoupon(req.params.id).then((response) => {
        res.json(response)
    })
}

// USER APPLY COUPON
exports.postApplyCoupon = (req, res) => {
  let response = {}
  if (req.body.Coupon == '') {
    response.couponStatus = false;
    response.couponResponse  = "Coupon field empty"
    res.json(response)
  } else {
    couponHelper
      .findCoupon(req.body)
      .then((couponDetails) => {
        const [currentDate, currentMonth, currentYear] = new Date()
          .toLocaleDateString()
          .split("/");
        const dateNow = currentYear + "-" + currentMonth + "-" + currentDate;
        if (dateNow > couponDetails.CouponExpiryDate) {
          if (couponDetails.CouponExpiryStatus == "expired") {
            response.couponResponse = "Coupon has expiried";
            response.couponStatus = false;
            res.json(response);
          } else {
            couponHelper
              .changeExpiryStatus(couponDetails._id)
              .then((response) => {
                res.json(response)
              });
          }
        } else {
          if (!couponDetails.CouponUsers) {
            couponHelper.applyCoupon(couponDetails._id, req.session.user._id).then(() => {
              cartHelpers.addCouponDetails(couponDetails, req.session.user._id).then(async(response) => {
                req.session.couponOffer = couponDetails.CouponOffer;
                let grandTotal =await cartHelpers.getTotalAmount(req.session.user._id, req.session.couponOffer);
                response.grandTotal = grandTotal
                response.couponStatus = true;
                res.json(response);
              });
            });
          } else {
            couponHelper.checkCouponUser(couponDetails._id, req.session.user._id).then((response) => {
              if (response.status) {
                response.couponResponse = "Coupon already used by user";
                response.couponStatus = false;
                res.json(response);
              } else {
                couponHelper
                  .applyCoupon(couponDetails._id, req.session.user._id)
                  .then(() => {
                    cartHelpers.addCouponDetails(couponDetails, req.session.user._id).then(async(response) => {
                      req.session.couponOffer = couponDetails.CouponOffer;
                      let grandTotal =await cartHelpers.getTotalAmount(req.session.user._id, req.session.couponOffer);
                      response.grandTotal = grandTotal
                      response.couponStatus = true;
                      res.json(response);
                    })
                  });
              }
            })
          }
        }
      });
  }
};