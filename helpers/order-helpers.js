var db = require("../config/connection");
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");

var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");
const { resolve } = require("node:path");

const CC = require("currency-converter-lt");
let currencyConverter = new CC();


var instance = new Razorpay({
  key_id: "rzp_test_ABYYBYRSszOaqh",
  key_secret: "YNQjPnQYsnX6mCkHEQZJcYhm",
});


paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret:process.env.CLIENT_SECRET
});

module.exports = {
  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      let status = order.paymentMethod === "COD" ? "placed" : "pending";
      let Orderstatus = order.paymentMethod === "COD" ? "success" : "failed";
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
            $addFields: {
              productStatus: "ordered",
              totalOfProduct: {
                $multiply: ["$quantity", { $toInt: "$productDetails.Price" }],
              },
            },
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
        orderStatus: Orderstatus,
      };

      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          let orderId = response.insertedId;
          if (order.paymentMethod === "COD") {
            db.get()
              .collection(collection.CART_COLLECTION)
              .deleteOne({ user: ObjectId(order.user) });
          }
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
  generateRazorpay: (orderId, totalPrice, userId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ user: ObjectId(userId) });
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
  generatePaypal: (orderId, totalPrice, userId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ user: ObjectId(userId) });
      let totalPriceUSD = await currencyConverter
        .from("INR")
        .to("USD")
        .amount(totalPrice)
        .convert();
      totalPriceUSD = parseFloat(totalPriceUSD).toFixed(2);
      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [
          {
            amount: {
              currency: "USD",
              total: totalPriceUSD,
            },
            description: orderId,
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error);
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              resolve(payment.links[i].href);
              // res.redirect(payment.links[i].href);
            }
          }
        }
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
              orderStatus: "success",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  orderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(order);
    });
  },
  updateProductOrderStatus: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.orderId),
            "products.item": ObjectId(details.productId),
          },
          {
            $set: {
              "products.$.productStatus": details.value,
            },
          }
        )
        .then((response) => {
          response.productStatus = details.value;
          response.status = true;
          resolve(response);
        });
    });
  },
  totalSales: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              sales: {
                $sum: "$totalAmount",
              },
            },
          },
        ])
        .toArray();
      resolve(sales);
    });
  },
  totalPaymentMethod: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: "$paymentMethod",
              sales: {
                $sum: "$totalAmount",
              },
              // totalPercent: {
              //   $push: {
              //     _id: "$paymentMethod",
              //     totalAmount: "$totalAmount",
              //   },
              // },
            },
          },
          // {
          //   $unwind: {
          //     path: "$totalPercent",
          //   },
          // },
          // {
          //   $project: {
          //     _id: "$totalPercent._id",
          //     sales: "$totalPercent.totalAmount",
          //     sum: "$sales",
          //     percent: {
          //       $multiply: [
          //         { $divide: ["$totalPercent.totalAmount", "$sales"] },
          //         100,
          //       ],
          //     },
          //   },
          // },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();
      resolve(sales);
    });
  },
  noOfSales: () => {
    return new Promise((resolve, reject) => {
      let noOfSales = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .count();
      resolve(noOfSales);
    });
  },
  weeklySales: () => {
    return new Promise((resolve, reject) => {
      let result = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                week: { $week: "$Date" },
                year: { $year: "$Date" },
              },
              total: {
                $sum: "$totalAmount",
              },
              
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();
      resolve(result);
    })
  },
  monthlySales: () => {
    return new Promise((resolve, reject) => {
      let monthlySales = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          // {
          //   $match: {
          //     "Date": {
          //       $gte: new Date("2022-01-01"),
          //       $lt: new Date("2023-01-01"),
          //     },
          //   },
          // },
          // {
          //   $group: {
          //     _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
          //     totalSaleAmount: { $sum: "$totalAmount" },
          //   },
          // },
          {
            $group: {
              _id: {
                month: { $month: "$Date" },
                year: { $year: "$Date" },
              },
              total: {
                $sum: "$totalAmount",
              },
            },
          },
          {
            $sort: { _id : 1},
          },
        ])
        .toArray();
      resolve(monthlySales);
    });
  },
  yearlySales: () => {
    return new Promise((resolve, reject) => {
      let result = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
               
                year: { $year: "$Date" },
              },
              total: {
                $sum: "$totalAmount",
              },
              
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();
      resolve(result);
    })
  },
  salesEachMonthSales: () => {
    return new Promise(async (resolve, reject) => {
      let result = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
              totalSales: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      resolve(result);
    });
  },
  lastDateSales: () => {
    return new Promise(async(resolve, reject) => {
      let result = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $sort: { Date: 1 } },
          {
            $group: {
              _id: null,
              lastSalesDate: { $last: "$Date" },
              lastDateAmount: { $last: { $sum: "$totalAmount" } },
            },
          },
        ])
        .toArray();
      resolve(result)
    })
  },
};
