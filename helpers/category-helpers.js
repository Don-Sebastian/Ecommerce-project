var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

module.exports = {
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      let categories = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(categories);
    });
  },
  addCategory: (category, callback) => {
    // console.log(product);
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .insertOne(category)
      .then((data) => {
        // callback(data.insertedId);
      });
  },
  getCategoryDetails: (categoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectID(categoryId) })
        .then((category) => {
          resolve(category);
        });
    });
  },
  updateCategoryreq: (categoryId, categoryDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: ObjectID(categoryId) },
          {
            $set: {
              CategoryName: categoryDetails.CategoryName,
              CategoryDescription: categoryDetails.CategoryDescription,
              CategoryImage: categoryDetails.CategoryImage,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  deleteCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      console.log(categoryId);

      let delCategory = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(categoryId) })
        .then((response) => {
          console.log(ObjectId(categoryId));

          resolve();
        });
    });
  },
  getCategoryProducts: (categoryID) => {
    let result = {};
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectId(categoryID) });

      result.CategoryName = category.CategoryName;
      resolve(result);
    }).then((result) => {
      return new Promise(async (resolve, reject) => {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find({ Category: result.CategoryName })
          .toArray();

        resolve(products);
      });
    });
  },
  getCategoryNames: () => {
    
  },
};