/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
const { ObjectId } = require('mongodb');
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectID } = require('bson');
const collection = require('../config/collections');
const db = require('../config/connection');
const { CATEGORY_COLLECTION, PRODUCT_COLLECTION } = require('../config/collections');

module.exports = {
  addProduct: (product) => {
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .insertOne(product)
      .then(() => {});
  },
  getAllProducts: () => new Promise(async (resolve, reject) => {
    const products = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find()
      .toArray();
    resolve(products);
  }),
  deleteProduct: (productId) => new Promise(async (resolve, reject) => {
    const productDetails = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .findOne({ _id: ObjectId(productId) });
    await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .deleteOne({ _id: ObjectId(productId) })
      .then((response) => {
        response.productDetails = productDetails;
        response.status = true;
        resolve(response);
      });
  }),
  getProductDetails: (productId) => new Promise((resolve, reject) => {
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .aggregate([
        {
          $match: { _id: ObjectID(productId) },
        },
        {
          $project: {
            Name: 1,
            Price: 1,
            Category: 1,
            Description: 1,
            Image: 1,
          },
        },
        {
          $lookup: {
            from: CATEGORY_COLLECTION,
            localField: 'Category',
            foreignField: 'CategoryName',
            as: 'category',
          },
        },
        {
          $unwind: '$category',
        },
        {
          $project: {
            _id: 1,
            Name: 1,
            Price: 1,
            Description: 1,
            Stock: 1,
            productOffer: 1,
            salePrice: 1,
            Image: 1,
            Category: 1,
            Date: 1,
            biggerDiscount: {
              $cond: {
                if: {
                  $gt: [
                    { $toInt: '$productOffer' },
                    { $toInt: '$category.CategoryOffer' },
                  ],
                },
                then: '$productOffer',
                else: '$category.CategoryOffer',
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
                      { $toInt: '$Price' },
                      { $toInt: '$biggerDiscount' },
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
                  { $toInt: '$Price' },
                  { $toInt: '$discountedAmount' },
                ],
              },
            },
          },
        },
      ])
      .toArray()
      .then((product) => {
        resolve(product);
      });
  }),
  updateProductreq: (productId, productDetails) => new Promise((resolve, reject) => {
    if (productDetails.Image.length === 0) {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectID(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Price: productDetails.Price,
              Category: productDetails.Category,
              subCategory: productDetails.subCategory,
              Description: productDetails.Description,
              productOffer: productDetails.productOffer,
              Stock: productDetails.Stock,
            },
          },
        )
        .then((response) => {
          resolve();
        });
    } else {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectID(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Price: productDetails.Price,
              Category: productDetails.Category,
              subCategory: productDetails.subCategory,
              Description: productDetails.Description,
              productOffer: productDetails.productOffer,
              Stock: productDetails.Stock,
              Image: productDetails.Image,
            },
          },
        )
        .then((response) => {
          resolve();
        });
    }
  }),
  getAllProductsAndCategory: () => new Promise(async (resolve, reject) => {
    const response = {};
    // let products = await db
    //   .get()
    //   .collection(collection.PRODUCT_COLLECTION)
    //   .find()
    //   .toArray();

    const products = await db
      .get()
      .collection(PRODUCT_COLLECTION)
      .aggregate([
        {
          $lookup: {
            from: CATEGORY_COLLECTION,
            localField: 'Category',
            foreignField: 'CategoryName',
            as: 'category',
          },
        },
        {
          $unwind: '$category',
        },
        {
          $project: {
            _id: 1,
            Name: 1,
            Price: 1,
            Stock: 1,
            productOffer: 1,
            salePrice: 1,
            Image: 1,
            Category: 1,
            Date: 1,
            biggerDiscount: {
              $cond: {
                if: {
                  $gt: [
                    { $toInt: '$productOffer' },
                    { $toInt: '$category.CategoryOffer' },
                  ],
                },
                then: '$productOffer',
                else: '$category.CategoryOffer',
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
                      { $toInt: '$Price' },
                      { $toInt: '$biggerDiscount' },
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
                  { $toInt: '$Price' },
                  { $toInt: '$discountedAmount' },
                ],
              },
            },
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
      ])
      .toArray();

    const category = await db
      .get()
      .collection(collection.CATEGORY_COLLECTION)
      .find()
      .toArray();
    response.products = products;
    response.category = category;
    resolve(response);
  }),
  discount: (userId) => new Promise((resolve, reject) => {
    db.get()
      .collection(collection.CART_COLLECTION)
      .aggregate([
        {
          $match: {
            user: ObjectId(userId),
          },
        },
        {
          $unwind: '$products',
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity',
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product',
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] },
          },
        },

        {
          $lookup: {
            from: collection.CATEGORY_COLLECTION,
            localField: 'product.category',
            foreignField: 'category',
            as: 'category',
          },
        },
        {
          $unwind: '$category',
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: 1,
            category: 1,
            discountOff: {
              $cond: {
                if: {
                  $gt: [
                    { $toInt: '$product.productOffer' },
                    { $toInt: '$category.CategoryOffer' },
                  ],
                },
                then: '$product.productOffer',
                else: '$category.CategoryOffer',
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
                      { $toInt: '$product.price' },
                      { $toInt: '$discountOff' },
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
                  { $toInt: '$product.price' },
                  { $toInt: '$discountedAmount' },
                ],
              },
            },
          },
        },
        {
          $addFields: {
            totalAfterDiscount: {
              $multiply: ['$quantity', { $toInt: '$priceAfterDiscount' }],
            },
          },
        },
      ])
      .toArray()
      .then((discount) => {
        resolve(discount);
      });
  }),
  // eslint-disable-next-line arrow-body-style
  getSubCategoryProducts: (subcategoryDetails) => {
    return new Promise(async (resolve, reject) => {
      const products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: { Category: subcategoryDetails.CategoryName },
          },
          {
            $match: { subCategory: subcategoryDetails.subCategoryName },
          },
        ])
        .toArray();
      resolve(products);
    });
  },
  // eslint-disable-next-line arrow-body-style
  searchProduct: async (payload) => {
    // eslint-disable-next-line no-return-await
    return await db.get().collection(collection.PRODUCT_COLLECTION).find({ Name: { $regex: new RegExp(`^${payload}.*`, 'i') } }).toArray();
  },
};
