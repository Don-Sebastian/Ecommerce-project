var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { use } = require("../routes/user");


module.exports = {
  couponAdmin: () => {
    return new Promise((resolve, reject) => {
      let coupons = db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(coupons);
    });
  },
  addCoupon: (couponDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .insertOne(couponDetails)
        .then(() => {
          resolve();
        });
    });
  },
  getCouponDetails: (CouponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ _id: ObjectId(CouponId) })
        .then((coupon) => {
          resolve(coupon);
        });
    });
  },
  updateCoupon: (CouponId, CouponDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectID(CouponId) },
          {
            $set: {
              CouponName: CouponDetails.CouponName,
              CouponDescription: CouponDetails.CouponDescription,
              CouponOffer: CouponDetails.CouponOffer,
              CouponExpiryDate: CouponDetails.CouponExpiryDate,
              CouponExpiryDate: CouponDetails.CouponExpiryDate,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  deleteCoupon: (CouponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ _id: ObjectId(CouponId) })
        .then((response) => {
          response.status = true;
          resolve(response);
        });
    });
  },
  findCoupon: (couponName) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ CouponName: couponName.Coupon })
        .then((response) => {
          resolve(response);
        });
      //   .aggregate([
      //     {
      //       $match: { CouponName: couponName.Coupon },
      //     },
      //     {
      //         $project: {
      //           _id: 0,
      //         CouponName: 1,
      //         CouponDescription: 1,
      //         CouponOffer: 1,
      //         CouponExpiryDate: 1,
      //         CouponExpiryStatus: 1,

      //       },
      //     },
      //   ])
      //   .toArray()
      //   .then((response) => {
      //     console.log("===========", response);
      //     resolve(response);
      //   });
    });
  },
  changeExpiryStatus: (CouponId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectId(CouponId) },
          { $set: { CouponExpiryStatus: "expired" } }
        )
        .then((response) => {
          response.couponResponse = "Coupon has Expired";
          response.couponStatus = false;
          resolve(response);
        });
    });
  },
  applyCoupon: (CouponId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: ObjectId(CouponId) },
          {
            $push: { CouponUsers: userId },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  checkCouponUser: (CouponId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne(
          { _id: ObjectId(CouponId) },
          { CouponUsers: { $in: { userId } } }
        )
        .then((response) => {
          resolve({ status: true });
        });
    });
  },
};