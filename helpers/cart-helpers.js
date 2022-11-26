/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable import/order */
const db = require('../config/connection');
const collection = require('../config/collections');
const { ObjectId } = require('mongodb');

module.exports = {
  addToCart: (productId, userId) => {
    const productObj = {
      item: ObjectId(productId),
      quantity: 1,
    };

    // eslint-disable-next-line no-async-promise-executor, no-unused-vars
    return new Promise(async (resolve) => {
      const userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        const productExists = userCart.products.findIndex(
          (product) => product.item === productId,
        );
        if (productExists !== -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), 'products.item': ObjectId(productId) },
              {
                $inc: { 'products.$.quantity': 1 },
              },
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: productObj },
              },
            )
            .then((response) => {
              resolve(response);
            });
        }
      } else {
        const cartObj = {
          user: ObjectId(userId),
          products: [productObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  // eslint-disable-next-line arrow-body-style
  checkProductInCart: (productId, userId) => {
    return new Promise(async (resolve, reject) => {
      const product = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $match: { 'products.item': ObjectId(productId) },
          },
        ])
        .toArray();
      resolve(product);
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$products',
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
                  then: '$productDetails.productOffer',
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
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      const cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count, 10);
    details.quantity = parseInt(details.quantity, 10);

    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.cart),
            'products.item': ObjectId(details.product),
          },
          {
            $inc: { 'products.$.quantity': details.count },
          },
        )
        .then((response) => {
          resolve({ status: true });
        });
      // }
    });
  },
  removeProductFromCart: (details, count) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(details.cart) },
          {
            $pull: { products: { item: ObjectId(details.product) } },
          },
        )
        .then((response) => {
          count--;
          response.count = count;
          response.productId = details.product;
          response.removeProduct = true;
          resolve(response);
        });
    });
  },
  getTotalAmount: (userId, couponDiscount) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$products',
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
          {
            $group: {
              _id: null,
              total: {
                $sum: '$totalAmount',
              },
            },
          },
        ])
        .toArray();
      if (couponDiscount) {
        total = total[0].total - total[0].total * (couponDiscount / 100);
        resolve(total);
      } else {
        resolve(total[0].total);
      }
    });
  },
  getTotalAmountProduct: (userId) => {
    return new Promise(async (resolve, reject) => {
      const totalAmountProduct = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$products',
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
            $project: {
              total: {
                $sum: {
                  $multiply: ['$quantity', { $toInt: '$productDetails.Price' }],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(totalAmountProduct);
    });
  },
  getCartProductsList: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      resolve(cart.products);
    });
  },
  getDiscountAmount: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$products',
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
        ])
        .toArray()
        .then((discount) => {
          resolve(discount);
        });
    });
  },
  addCouponDetails: (couponDetails, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: ObjectId(userId) },
          {
            $set: { couponDetails },
          },
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
};
