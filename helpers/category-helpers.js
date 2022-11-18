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
      .then((data) => {});
  },
  addSubCategory: (subCategory) => {
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
    return new Promise(async (resolve, reject) => {
      let subCategoryDetails = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $match: { "subCategory._id": ObjectId(subCategoryId) },
          },
          {
            $unwind: "$subCategory",
          },
          {
            $project: { _id: 0, subCategory: 1 },
          },
          {
            $match: { "subCategory._id": ObjectId(subCategoryId) },
          },
        ])
        .toArray();
      resolve(subCategoryDetails);
    });
  },
  getCategoryDetailsbyName: (categoryName) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ CategoryName: categoryName })
        .then((category) => {
          resolve(category);
        });
    });
  },
  getCategoryDetails: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      // let subCategory = await db.get().collection(collection.CATEGORY_COLLECTION).find({ "subCategory._id": ObjectId(categoryId) }).toArray()
      // console.log("+++++++++++++++++++++");
      // console.log(subCategory);
      // if (subCategory == null) {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectID(categoryId) })
        .then((category) => {
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
  updateSubCategoryreq: (subCategoryId, subcategoryDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          {
            CategoryName: subcategoryDetails.CategoryName,
            "subCategory._id": ObjectId(subCategoryId),
          },
          {
            $set: {
              "subCategory.$.CategoryName": subcategoryDetails.CategoryName,
              "subCategory.$.subCategoryName":
                subcategoryDetails.subCategoryName,
              "subCategory.$.subCategoryDescription":
                subcategoryDetails.subCategoryDescription,
            },
          }
        )
        // .aggregate([
        //   {
        //     $match: { "subCategory._id": ObjectId(subCategoryId) },
        //   },
        //   {
        //     $unwind: "$subCategory",
        //   },
        //   {
        //     $match: { "subCategory._id": ObjectId(subCategoryId) },
        //   },
        //   {
        //     $set: { 'subCategory': subcategoryDetails },
        //   },
        // ])
        // .toArray()
        .then((response) => {
          resolve(response);
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
              CategoryOffer: categoryDetails.CategoryOffer,
              CategoryaExpiryDate: categoryDetails.CategoryaExpiryDate,
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
        .deleteOne({ _id: ObjectId(categoryId) });

      resolve(delCategory);
    });
  },
  deleteSubCategory: (subCategoryId) => {
    return new Promise((resolve, reject) => {
      let delSubCategory = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { "subCategory._id": ObjectId(subCategoryId) },
          {
            $pull: {
              subCategory: {
                _id: ObjectId(subCategoryId),
              },
            },
          }
        );
      resolve(delSubCategory);
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
    return new Promise(async (resolve, reject) => {
      let categoryNames = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $project: { _id: 0, CategoryName: 1 },
          },
        ])
        .toArray();
      resolve(categoryNames);
    });
  },
  categorySubcategory: (details) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let subCategoryDetails = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $match: {
              "subCategory.CategoryName": details.categoryName,
            },
          },
          {
            $unwind: "$subCategory",
          },
          {
            $project: { _id: 0, subCategory: 1 },
          },
          {
            $match: {
              "subCategory.CategoryName": details.categoryName,
            },
          },
        ])
        .toArray();
      response.subCategoryDetails = subCategoryDetails;
      response.status = true;
      resolve(response);
    });
  },
};