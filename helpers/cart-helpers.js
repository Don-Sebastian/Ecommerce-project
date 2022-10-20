var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");

module.exports = {
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
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {_id: ObjectId(details.cart), "products.item": ObjectId(details.product) },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then(() => {
            resolve();
          });
    })
  },
};


