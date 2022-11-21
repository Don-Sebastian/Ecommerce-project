/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable arrow-body-style */
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');

const { ObjectId } = require('mongodb');

const CC = require('currency-converter-lt');
const db = require('../config/connection');
const collection = require('../config/collections');

const currencyConverter = new CC();

const instance = new Razorpay({
  key_id: 'rzp_test_ABYYBYRSszOaqh',
  key_secret: 'YNQjPnQYsnX6mCkHEQZJcYhm',
});

paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

module.exports = {
  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      const status = order.paymentMethod === 'COD' ? 'placed' : 'pending';
      const Orderstatus = order.paymentMethod === 'COD' ? 'success' : 'failed';
      const address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(order.user) },
          },
          {
            $unwind: { path: '$Address' },
          },
          {
            $match: { 'Address._id': { $in: [ObjectId(order.addressId)] } },
          },
          {
            $project: { Address: 1, _id: 0 },
          },
        ])
        .toArray();
      const productsInCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(order.user) },
          },
          {
            $unwind: { path: '$products' },
          },
          {
            $project: {
              item: '$products.item',
              quantity: '$products.quantity',
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'item',
              foreignField: '_id',
              as: 'productDetails',
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: { $arrayElemAt: ['$productDetails', 0] },
            },
          },
          {
            $addFields: {
              productStatus: 'ordered',
              totalQuantityPrice: {
                $multiply: ['$quantity', { $toInt: '$productDetails.Price' }],
              },
            },
          },
          {
            $lookup: {
              from: collection.CATEGORY_COLLECTION,
              localField: 'productDetails.Category',
              foreignField: 'CategoryName',
              as: 'category',
            },
          },
          {
            $unwind: '$category',
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              productDetails: 1,
              productStatus: 1,
              totalQuantityPrice: 1,
              category: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: '$productDetails.productOffer' },
                      { $toInt: '$category.CategoryOffer' },
                    ],
                  },
                  then: '$product.productOffer',
                  else: '$category.CategoryOffer',
                },
              },
            },
          },
          {
            $addFields: {
              discountedAmount: {
                $round: {
                  $divide: [
                    {
                      $multiply: [
                        { $toInt: '$productDetails.Price' },
                        { $toInt: '$discountOffer' },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              priceAfterDiscount: {
                $round: {
                  $subtract: [
                    { $toInt: '$productDetails.Price' },
                    { $toInt: '$discountedAmount' },
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              totalAfterDiscount: {
                $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }],
              },
            },
          },
          {
            $addFields: {
              totalAmount: {
                $cond: {
                  if: '$totalAfterDiscount',
                  then: '$totalAfterDiscount',
                  else: '$totalQuantityPrice',
                },
              },
            },
          },
        ])
        .toArray();
      const orderObj = {
        userId: ObjectId(order.user),
        deliveryDetails: address[0].Address,
        paymentMethod: order.paymentMethod,
        products: productsInCart,
        totalAmount: total,
        status,
        Date: new Date(),
        orderStatus: Orderstatus,
      };

      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          const orderId = response.insertedId;
          if (order.paymentMethod === 'COD') {
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
      const orders = await db
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
      const orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: '$products',
          },
        ])
        .toArray();

      resolve(orderItems);
    });
  },
  getOrdersAdmin: () => {
    return new Promise(async (resolve, reject) => {
      const orders = await db
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
          { $set: { orderStatus: orderDetails.orderStatus } },
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
      const options = {
        amount: totalPrice * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: `${orderId}`,
      };
      instance.orders.create(options, (err, order) => {
        // eslint-disable-next-line no-console
        console.log('New Order: ', order);
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
        .from('INR')
        .to('USD')
        .amount(totalPrice)
        .convert();
      totalPriceUSD = parseFloat(totalPriceUSD).toFixed(2);
      // eslint-disable-next-line camelcase
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
        },
        transactions: [
          {
            amount: {
              currency: 'USD',
              total: totalPriceUSD,
            },
            description: orderId,
          },
        ],
      };
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              resolve(payment.links[i].href);
            }
          }
        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
      // const { createHmac } = await import("node:crypto");
      // eslint-disable-next-line global-require
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
      hmac.update(
        `${details['payment[razorpay_order_id]']}|${
          details['payment[razorpay_payment_id]']}`,
      );

      hmac = hmac.digest('hex');

      if (hmac === details['payment[razorpay_signature]']) {
        resolve();
      } else {
        reject();
      }
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  },
  changePaymentStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: 'placed',
              orderStatus: 'success',
            },
          },
        )
        .then(() => {
          resolve();
        });
    });
  },
  orderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderId) });
      resolve(order);
    });
  },
  updateProductOrderStatus: (details) => {
    return new Promise(async (resolve, reject) => {
      if (details.value === 'refunded') {
        const amount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                _id: ObjectId(details.orderId),
                'products.item': ObjectId(details.productId),
              },
            },
            {
              $unwind: '$products',
            },
            {
              $project: {
                userId: 1,
                products: 1,
              },
            },
            {
              $match: {
                'products.item': ObjectId(details.productId),
              },
            },
          ])
          .toArray();
        const refund = amount[0].products.totalAmount;
        const { userId } = amount[0];
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $inc: { Wallet: refund },
            },
          );
      }
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.orderId),
            'products.item': ObjectId(details.productId),
          },
          {
            $set: {
              'products.$.productStatus': details.value,
            },
          },
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
      const sales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              sales: {
                $sum: '$totalAmount',
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
      const sales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: '$paymentMethod',
              sales: {
                $sum: '$totalAmount',
              },
            },
          },
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
      const noOfSales = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .count();
      resolve(noOfSales);
    });
  },
  weeklySales: () => {
    return new Promise((resolve, reject) => {
      const result = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                week: { $week: '$Date' },
                year: { $year: '$Date' },
              },
              total: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();
      resolve(result);
    });
  },
  monthlySales: () => {
    return new Promise((resolve, reject) => {
      const monthlySales = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                month: { $month: '$Date' },
                year: { $year: '$Date' },
              },
              total: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();
      resolve(monthlySales);
    });
  },
  yearlySales: () => {
    return new Promise((resolve, reject) => {
      const result = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$Date' },
              },
              total: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();
      resolve(result);
    });
  },
  salesEachMonthSales: () => {
    return new Promise(async (resolve, reject) => {
      const result = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$Date' } },
              totalSales: { $sum: '$totalAmount' },
            },
          },
        ])
        .toArray();
      resolve(result);
    });
  },
  lastDateSales: () => {
    return new Promise(async (resolve, reject) => {
      const result = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $sort: { Date: 1 } },
          {
            $group: {
              _id: null,
              lastSalesDate: { $last: '$Date' },
              lastDateAmount: { $last: { $sum: '$totalAmount' } },
            },
          },
        ])
        .toArray();
      resolve(result);
    });
  },
};
