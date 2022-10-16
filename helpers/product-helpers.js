var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("express");
const { ObjectId } = require("mongodb")
const { ObjectID } = require("bson");

module.exports = {
  addProduct: (product, callback) => {
    // console.log(product);
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .insertOne(product)
      .then((data) => {
        // callback(data.insertedId);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deleteProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      console.log(productId);

      let delProduct = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(productId) })
        .then((response) => {
          console.log(ObjectId(productId));

          resolve();
        });
    });
  },
  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectID(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProductreq: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectID(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Price: productDetails.Price,
              Category: productDetails.Category,
              Description: productDetails.Description,
              Image: productDetails.Image,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  getAllProductsAndCategory: () => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      response.products = products;
      response.category = category;
      console.log("--------------------------------");
      console.log(response);
      resolve(response);
    });
  },
};