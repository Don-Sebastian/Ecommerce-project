/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable arrow-body-style */
const { ObjectId } = require('mongodb');
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectID } = require('bson');
const db = require('../config/connection');
const collection = require('../config/collections');

module.exports = {
  addAndRemoveFromWishlist: (productId, userId) => {
    return new Promise(async (resolve, reject) => {
      const userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ userId: ObjectId(userId) });
      if (userWishlist) {
        const wishlistProduct = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .aggregate([
            {
              $match: { userId: ObjectId(userId) },
            },
            {
              $match: { products: ObjectId(productId) },
            },
          ])
          .toArray();
        if (wishlistProduct.length !== 0) {
          await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId) },
              {
                $pull: { products: ObjectId(productId) },
              },
            )
            .then((response) => {
              response.added = false;
              resolve(response);
            });
        } else {
          await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId) },
              {
                $push: { products: ObjectId(productId) },
              },
            )
            .then((response) => {
              response.added = true;
              resolve(response);
            });
        }
      } else {
        const wishlistObj = {
          userId: ObjectID(userId),
          products: [ObjectId(productId)],
        };
        await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishlistObj)
          .then((response) => {
            response.added = true;
            resolve(response);
          });
      }
    });
  },
  getWishlistCount: (userId) => new Promise(async (resolve, reject) => {
    let count = 0;
    const wishlistUser = await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .findOne({ userId: ObjectId(userId) });
    if (wishlistUser) {
      count = wishlistUser.products.length;
    }
    resolve(count);
  }),
  wishlistProducts: (userId) => new Promise(async (resolve, reject) => {
    const products = await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .aggregate([
        {
          $match: { userId: ObjectId(userId) },
        },
        {
          $unwind: '$products',
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'products',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $project: {
            _id: 0,
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
            productDetails: 1,
            totalQuantityPrice: 1,
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
            finalPrice: {
              $round: {
                $subtract: [
                  { $toInt: '$productDetails.Price' },
                  { $toInt: '$discountedAmount' },
                ],
              },
            },
          },
        },
      ])
      .toArray();
    resolve(products);
  }),
  checkProductWishlist: (productId, userId) => new Promise(async (resolve, reject) => {
    const product = await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .aggregate([
        {
          $match: { userId: ObjectId(userId) },
        },
        {
          $match: { products: ObjectId(productId) },
        },
      ])
      .toArray();
    resolve(product);
  }),
  deleteProductWishlist: (productId, userId) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .updateOne(
        { userId: ObjectId(userId) },
        {
          $pull: { products: ObjectId(productId) },
        },
      )
      .then((response) => {
        response.wishlistProductDeleted = true;
        resolve(response);
      });
  }),
};
