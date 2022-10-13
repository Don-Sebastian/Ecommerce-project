var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("express");
const { ObjectId } = require("mongodb").ObjectId


module.exports = {
    addProduct: (product, callback) => {
        // console.log(product);

        db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .insertOne(product)
            .then((data) => {
                console.log("-----------------")
              console.log(data.insertedId);
            callback(data.insertedId);
          });
    },

}