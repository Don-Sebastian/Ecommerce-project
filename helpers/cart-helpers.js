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
  getTotalAmount: (userId) => {
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
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$productDetails.Price" }],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(total[0].total);
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
      resolve(totalAmountProduct);
    });
  },
  getCartProductsList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
      resolve(cart.products)
    })
  },
};

