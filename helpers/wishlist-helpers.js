var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

module.exports = {
  addAndRemoveFromWishlist: (productId, userId) => {
    let productObj = {
      items: ObjectId(productId),
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ userId: ObjectId(userId) });
      if (userWishlist) {
        let wishlistProduct = await db
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
        if (wishlistProduct.length != 0) {
          await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId) },
              {
                $pull: { products: ObjectId(productId) },
              }
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
              }
            )
            .then((response) => {
              response.added = true;
              resolve(response);
            });
        }
      } else {
        let wishlistObj = {
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
  getWishlistCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlistUser = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ userId: ObjectId(userId) });
      if (wishlistUser) {
        count = wishlistUser.products.length;
      }
      resolve(count);
    });
  },
  wishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              _id: 0,
              productDetails: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          {
            $lookup: {
              from: collection.CATEGORY_COLLECTION,
              localField: "productDetails.Category",
              foreignField: "CategoryName",
              as: "category",
            },
          },
          {
            $unwind: "$category",
          },
          {
            $project: {
              productDetails: 1,
              totalQuantityPrice: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: "$productDetails.productOffer" },
                      { $toInt: "$category.CategoryOffer" },
                    ],
                  },
                  then: "$product.productOffer",
                  else: "$category.CategoryOffer",
                },
              },
              // productOffer:"$product.productOffer",
              // productOffer:'$category.CategoryOffer',
            },
          },
          {
            $addFields: {
              discountedAmount: {
                $round: {
                  $divide: [
                    {
                      $multiply: [
                        { $toInt: "$productDetails.Price" },
                        { $toInt: "$discountOffer" },
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
                    { $toInt: "$productDetails.Price" },
                    { $toInt: "$discountedAmount" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      console.log("============", products);
      resolve(products);
    });
  },
  checkProductWishlist: (productId, userId) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
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
    });
  },
    deleteProductWishlist: (productId, userId) => {
        return new Promise(async(resolve, reject) => {
          await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: ObjectId(userId) },
              {
                $pull: { products: ObjectId(productId) },
              }
            )
            .then((response) => {
              response.wishlistProductDeleted = true;
              resolve(response);
            });
      })
  },
};