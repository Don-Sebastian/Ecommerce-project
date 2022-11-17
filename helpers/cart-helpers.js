var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");

module.exports = {
  addToCart: (productId, userId) => {
    let productObj = {
      item: ObjectId(productId),
      quantity: 1,
    };

    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        let productExists = userCart.products.findIndex(
          (product) => product.item == productId
        );
        if (productExists != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
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
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
        // db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, {

        //     $push:{products: productObj}

        // }).then((response) => {
        //   resolve(response)
        // })
      } else {
        let cartObj = {
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
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
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
          {
            $addFields: {
              totalQuantityPrice: {
                $multiply: ["$quantity", { $toInt: "$productDetails.Price" }],
              },
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
              item: 1,
              quantity: 1,
              productDetails: 1,
              totalQuantityPrice: 1,
              category: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: "$productDetails.productOffer" },
                      { $toInt: "$category.categoryOffer" },
                    ],
                  },
                  then: "$product.productOffer",
                  else: "$category.CategoryOffer",
                },
              },
              // productOffer:"$product.productOffer",
              // productOffer:'$category.categoryOffer',
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
              priceAfterDiscount: {
                $round: {
                  $subtract: [
                    { $toInt: "$productDetails.Price" },
                    { $toInt: "$discountedAmount" },
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              totalAfterDiscount: {
                $multiply: ["$quantity", { $toInt: "$priceAfterDiscount" }],
              },
            },
          },

          // {
          //   $lookup: {
          //     from: collection.PRODUCT_COLLECTION,
          //     let: { productList: "$products" },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $in: ["$_id", "$$productList"],
          //           },
          //         },
          //       },
          //     ],
          //     as:'cartItems'
          //   },
          // },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
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
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise(async (resolve, reject) => {
      // if (details.count == -1 && details.quantity == 1) {
      //   db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart)}, {
      //     $pull: {products: {item: ObjectId(details.product)}}
      //   }).then((response) => {
      //     resolve({removeProduct: true})
      //   })
      // } else {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(details.cart),
            "products.item": ObjectId(details.product),
          },
          {
            $inc: { "products.$.quantity": details.count },
          }
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
          }
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
  // getTotalAmount: (userId, couponDiscount) => {
  //   return new Promise(async (resolve, reject) => {
  //     let total = await db
  //       .get()
  //       .collection(collection.CART_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { user: ObjectId(userId) },
  //         },
  //         {
  //           $unwind: "$products",
  //         },
  //         {
  //           $project: {
  //             item: "$products.item",
  //             quantity: "$products.quantity",
  //             couponDetails: 1,
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: collection.PRODUCT_COLLECTION,
  //             localField: "item",
  //             foreignField: "_id",
  //             as: "productDetails",
  //           },
  //         },
  //         {
  //           $project: {
  //             item: 1,
  //             quantity: 1,
  //             productDetails: { $arrayElemAt: ["$productDetails", 0] },
  //             couponDetails: 1,
  //           },
  //         },
  //         {
  //           $addFields: {
  //             totalQuantityPrice: {
  //               $multiply: ["$quantity", { $toInt: "$productDetails.Price" }],
  //             },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: collection.CATEGORY_COLLECTION,
  //             localField: "productDetails.Category",
  //             foreignField: "CategoryName",
  //             as: "category",
  //           },
  //         },
  //         {
  //           $unwind: "$category",
  //         },
  //         {
  //           $project: {
  //             item: 1,
  //             quantity: 1,
  //             productDetails: 1,
  //             totalQuantityPrice: 1,
  //             category: 1,
  //             couponDetails: 1,
  //             discountOffer: {
  //               $cond: {
  //                 if: {
  //                   $gt: [
  //                     { $toInt: "$productDetails.productOffer" },
  //                     { $toInt: "$category.categoryOffer" },
  //                   ],
  //                 },
  //                 then: "$product.productOffer",
  //                 else: "$category.CategoryOffer",
  //               },
  //             },
  //             // productOffer:"$product.productOffer",
  //             // productOffer:'$category.categoryOffer',
  //           },
  //         },
  //         {
  //           $addFields: {
  //             discountedAmount: {
  //               $round: {
  //                 $divide: [
  //                   {
  //                     $multiply: [
  //                       { $toInt: "$productDetails.Price" },
  //                       { $toInt: "$discountOffer" },
  //                     ],
  //                   },
  //                   100,
  //                 ],
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $addFields: {
  //             priceAfterDiscount: {
  //               $round: {
  //                 $subtract: [
  //                   { $toInt: "$productDetails.Price" },
  //                   { $toInt: "$discountedAmount" },
  //                 ],
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $addFields: {
  //             totalAfterDiscount: {
  //               $multiply: ["$quantity", { $toInt: "$priceAfterDiscount" }],
  //             },
  //           },
  //         },
  //         {
  //           $addFields: {
  //             totalAmount: {
  //               $cond: {
  //                 if: "$totalAfterDiscount",
  //                 then: "$totalAfterDiscount",
  //                 else: "$totalQuantityPrice",
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: null,
  //             couponOffer: "$couponDetails.CouponOffer",
  //             total: {
  //               $sum: "$totalAmount",
  //             },
  //           },
  //         },
  //         // {
  //         //   $addFields: {
  //         //     totalAfterCoupon: {
  //         //       $cond: {
  //         //         if: "$couponDetails.CouponOffer",
  //         //         then: "$couponDetails.CouponOffer",
  //         //         else: "$totalAmount",
  //         //       },
  //         //     },
  //         //   },
  //         // },
  //         // {
  //         //   $addFields: {
  //         //     totalAfterCoupon: {
  //         //       $cond: {
  //         //         if: "$couponDetails.CouponOffer",
  //         //         then: {
  //         //           $group: {
  //         //             _id: null,
  //         //             total: {
  //         //               $sum: "$totalAmount",
  //         //             },
  //         //           },
  //         //           $round: {
  //         //             $subtract: [
  //         //               { $toInt: "$total" },
  //         //               {
  //         //                 $multiply: [
  //         //                   { $toInt: "$total" },
  //         //                   {
  //         //                     $divide: [
  //         //                       { $toInt: "$couponDetails.CouponOffer" },100
  //         //                     ],
  //         //                   },
  //         //                 ],
  //         //               },
  //         //             ],
  //         //           },
  //         //         },
  //         //         else: {
  //         //           $group: {
  //         //             _id: null,
  //         //             total: {
  //         //               $sum: "$totalAmount",
  //         //             },
  //         //           }
  //         //         }
  //         //       },
  //         //     },
  //         //   },
  //         // },
  //       ])
  //       .toArray();
  //     console.log("-------------------tota;", total);
  //     // if (couponDiscount) {
  //     //   total = total[0].total - total[0].total * (couponDiscount / 100);
  //     //   resolve(total);
  //     // } else {
  //       resolve(total[0].total);
  //     // }
  //   });
  // },
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
          {
            $addFields: {
              totalQuantityPrice: {
                $multiply: ["$quantity", { $toInt: "$productDetails.Price" }],
              },
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
              item: 1,
              quantity: 1,
              productDetails: 1,
              totalQuantityPrice: 1,
              category: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: "$productDetails.productOffer" },
                      { $toInt: "$category.categoryOffer" },
                    ],
                  },
                  then: "$product.productOffer",
                  else: "$category.CategoryOffer",
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
              priceAfterDiscount: {
                $round: {
                  $subtract: [
                    { $toInt: "$productDetails.Price" },
                    { $toInt: "$discountedAmount" },
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              totalAfterDiscount: {
                $multiply: ["$quantity", { $toInt: "$priceAfterDiscount" }],
              },
            },
          },
          {
            $addFields: {
              totalAmount: {
                $cond: {
                  if: "$totalAfterDiscount",
                  then: "$totalAfterDiscount",
                  else: "$totalQuantityPrice",
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$totalAmount",
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
      let totalAmountProduct = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
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
          {
            $project: {
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$productDetails.Price" }],
                },
              },
            },
          },
        ])
        .toArray();
      console.log("===============", totalAmountProduct);
      resolve(totalAmountProduct);
    });
  },
  getCartProductsList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
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
              item: 1,
              quantity: 1,
              productDetails: 1,
              category: 1,
              discountOffer: {
                $cond: {
                  if: {
                    $gt: [
                      { $toInt: "$productDetails.productOffer" },
                      { $toInt: "$category.categoryOffer" },
                    ],
                  },
                  then: "$product.productOffer",
                  else: "$category.CategoryOffer",
                },
              },
              // productOffer:"$product.productOffer",
              // productOffer:'$category.categoryOffer',
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
              priceAfterDiscount: {
                $round: {
                  $subtract: [
                    { $toInt: "$productDetails.Price" },
                    { $toInt: "$discountedAmount" },
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              totalAfterDiscount: {
                $multiply: ["$quantity", { $toInt: "$priceAfterDiscount" }],
              },
            },
          },
        ])
        .toArray()
        .then((discount) => {
          console.log("--------------------", discount);
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
            $set: { couponDetails: couponDetails },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
};

