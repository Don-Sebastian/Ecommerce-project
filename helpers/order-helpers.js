var db = require("../config/connection");
const Razorpay = require("razorpay");

var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");
const { resolve } = require("node:path");

var instance = new Razorpay({
  key_id: "rzp_test_ABYYBYRSszOaqh",
  key_secret: "YNQjPnQYsnX6mCkHEQZJcYhm",
});

module.exports = {
  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      let status = order.paymentMethod === "COD" ? "placed" : "pending";
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(order.user) },
          },
          {
            $unwind: { path: "$Address" },
          },
          {
            $match: { "Address._id": { $in: [ObjectId(order.addressId)] } },
          },
          {
            $project: { Address: 1, _id: 0 },
          },
        ])
        .toArray();
      let productsInCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(order.user) },
          },
          {
            $unwind: { path: "$products" },
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          {
            $addFields: { "productDetails.productStatus": "ordered" },
          },
        ])
        .toArray();
      let orderObj = {
        userId: ObjectId(order.user),
        deliveryDetails: address[0].Address,
        paymentMethod: order.paymentMethod,
        products: productsInCart,
        totalAmount: total,
        status: status,
        Date: new Date(),
        orderStatus: "ordered",
      };

      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          let orderId = response.insertedId;
          // db.get()
          //   .collection(collection.CART_COLLECTION)
          //   .deleteOne({ user: ObjectId(order.user) });
          resolve(orderId);
        });
    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
        .sort({ _id: -1 })
        .toArray();
      resolve(orders);
    });
  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: "$products",
          },
        ])
        .toArray();

      console.log("------------------------", orderItems);
      console.log();
      resolve(orderItems);
    });
  },
  getOrdersAdmin: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(orders);
    });
  },
  updateOrderStatus: (orderDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderDetails.orderId) },
          { $set: { orderStatus: orderDetails.orderStatus } }
        )
        .then((response) => {
          response.orderStatus = orderDetails.orderStatus;
          response.status = true;
          resolve(response);
        });
    });
  },
  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        console.log("New Order: ", order);
        resolve(order);
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
      // const { createHmac } = await import("node:crypto");
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );

      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    }).catch((err) => {
      console.log(err);
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  orderProducts: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).aggregate;
    });
  },
  orderDetails: (orderId) => {
    return new Promise(async(resolve, reject) => {
      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
      resolve(order);
      
    })
  },
};
