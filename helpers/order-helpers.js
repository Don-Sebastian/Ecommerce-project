var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");

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
              productDetails: 1,
            },
          },
        ])
        .toArray();
      console.log("00000000000000000000000000000000000");
      console.log(productsInCart);
      let orderObj = {
        userId: ObjectId(order.user),
        deliveryDetails: address[0].Address,
        paymentMethod: order.paymentMethod,
        products: products,
        totalAmount: total,
        status: status,
        Date: new Date(),
        orderStatus: "ordered",
      };

      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: ObjectId(order.user) });
          resolve();
        });
    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
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
        ])
        .toArray();
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
    })
  },
};
