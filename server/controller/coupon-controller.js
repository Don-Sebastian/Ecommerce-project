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
    console.log("--------------", req.body);
    couponHelper.findCoupon(req.body, req.session.user.id).then((couponDetails) => {
        const [currentDate, currentMonth, currentYear] = new Date()
          .toLocaleDateString()
          .split("/");
        const dateNow = currentYear + "-" + currentMonth + "-" + currentDate;
        if (dateNow > couponDetails.CouponExpiryDate) {
          if (couponDetails.CouponExpiryStatus == "expired") {
            req.session.couponResponse = "Coupon has expiried"
            let response = {};
            response.couponResponse = req.session.couponResponse;
            res.json(response)
          } else {
            couponHelper
              .changeExpiryStatus(couponDetails._id)
              .then((response) => {
                console.log(("response", response));
              });
          }
        } else {
          if ((couponDetails.CouponUsers).length == 0) {
            
          }
        }
    })
};