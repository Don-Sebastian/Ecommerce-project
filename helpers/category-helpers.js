/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable arrow-body-style */
const { ObjectId } = require('mongodb');
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectID } = require('bson');
const collection = require('../config/collections');
const db = require('../config/connection');

module.exports = {
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      const categories = await db
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
          $push: { subCategory },
        },
      )
      .then(() => {});
  },
  getSubCategoryDetails: (subCategoryId) => {
    return new Promise(async (resolve, reject) => {
      const subCategoryDetails = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $match: { 'subCategory._id': ObjectId(subCategoryId) },
          },
          {
            $unwind: '$subCategory',
          },
          {
            $project: { _id: 0, subCategory: 1 },
          },
          {
            $match: { 'subCategory._id': ObjectId(subCategoryId) },
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
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectID(categoryId) })
        .then((category) => {
          resolve(category);
        });
    });
  },
  updateSubCategoryreq: (subCategoryId, subcategoryDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          {
            CategoryName: subcategoryDetails.CategoryName,
            'subCategory._id': ObjectId(subCategoryId),
          },
          {
            $set: {
              'subCategory.$.CategoryName': subcategoryDetails.CategoryName,
              'subCategory.$.subCategoryName':
                subcategoryDetails.subCategoryName,
              'subCategory.$.subCategoryDescription':
                subcategoryDetails.subCategoryDescription,
            },
          },
        )
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
          },
        )
        .then((response) => {
          resolve();
        });
    });
  },
  deleteCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      const delCategory = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(categoryId) });

      resolve(delCategory);
    });
  },
  deleteSubCategory: (subCategoryId) => {
    return new Promise((resolve, reject) => {
      const delSubCategory = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { 'subCategory._id': ObjectId(subCategoryId) },
          {
            $pull: {
              subCategory: {
                _id: ObjectId(subCategoryId),
              },
            },
          },
        );
      resolve(delSubCategory);
    });
  },
  getCategoryProducts: (categoryID) => {
    const result = {};
    return new Promise(async (resolve, reject) => {
      const category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectId(categoryID) });

      result.CategoryName = category.CategoryName;
      resolve(result);
    }).then((result) => {
      return new Promise(async (resolve, reject) => {
        const products = await db
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
      const categoryNames = await db
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
    const response = {};
    return new Promise(async (resolve, reject) => {
      const subCategoryDetails = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .aggregate([
          {
            $match: {
              'subCategory.CategoryName': details.categoryName,
            },
          },
          {
            $unwind: '$subCategory',
          },
          {
            $project: { _id: 0, subCategory: 1 },
          },
          {
            $match: {
              'subCategory.CategoryName': details.categoryName,
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
