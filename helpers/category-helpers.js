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
addCategory: (category) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .insertOne(category)
        .then((data) => { });
    
  },
addSubCategory:(subCategory) => {
    subCategory._id = ObjectId();
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .updateOne(
        { CategoryName: subCategory.CategoryName },
        {
          $push: { subCategory: subCategory },
        }
      )
      .then(() => {});
  },
  getSubCategoryDetails: (subCategoryId) => {
    return new Promise(async(resolve, reject) => {
        let subCategoryDetails = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .aggregate([
            {
              $match: { "subCategory._id": ObjectId(categoryId) },
            },
            {
              $unwind: "$subCategory",
            },
            {
              $project: { _id: 0, subCategory: 1 },
            },
            {
              $match: { "subCategory._id": ObjectId(categoryId) },
            },
          ])
        .toArray();
      console.log(subCategoryDetails);
      resolve(subCategoryDetails);
    })
  },
  getCategoryDetails: (categoryId) => {
    return new Promise(async(resolve, reject) => {
      // let subCategory = await db.get().collection(collection.CATEGORY_COLLECTION).find({ "subCategory._id": ObjectId(categoryId) }).toArray()
      // console.log("+++++++++++++++++++++");
      // console.log(subCategory);
      // if (subCategory == null) {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .findOne({ _id: ObjectID(categoryId) })
          .then((category) => {
            console.log(category);
            resolve(category);
          });
      // }
      // else {
          
      //   let subCategoryDetails = await db
      //     .get()
      //     .collection(collection.CATEGORY_COLLECTION)
      //     .aggregate([
      //       {
      //         $match: { "subCategory._id": ObjectId(categoryId) },
      //       },
      //       {
      //         $unwind: "$subCategory",
      //       },
      //       {
      //         $project: { _id: 0, subCategory: 1 },
      //       },
      //       {
      //         $match: { "subCategory._id": ObjectId(categoryId) },
      //       },
      //     ])
      //     .toArray();
      //   resolve(subCategoryDetails);
      // }
        
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

      let delCategory = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(categoryId) })

          resolve(delCategory);
        
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
    return new Promise(async(resolve, reject) => {
      let categoryNames =await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $project: {_id: 0, CategoryName: 1 },
          },
        ]).toArray();
      resolve(categoryNames)
    })
  },
};