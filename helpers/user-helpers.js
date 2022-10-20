var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");


module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let userDetailID = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (userDetailID) {
        console.log("User exist");
        resolve({ userExist: true });
      } else {
        userData.Blocked = false;
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            response.userData = userData;
            response.userExist = false;
            resolve(response);
          });
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        if (!user.Blocked) {
          bcrypt.compare(userData.Password, user.Password).then((status) => {
            if (status) {
              console.log("Login success");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("Login failed");
              response.loginErr = "Invalid Password";
              response.status = false;
              resolve(response);
            }
          });
        } else {
          console.log("Login failed User Blocked");
          response.loginErr = "User is Blocked";
          response.status = false;
          resolve(response);
        }
      } else {
        console.log("Login failed User not found");
        response.loginErr = "Invalid Email ID";
        response.status = false;
        resolve(response);
      }
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(userDetails);
      console.log(userDetails);
    });
  },

  OTPLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phonenumber: userData.phonenumber });
      if (user) {
        if (!user.Blocked) {
          response.user = user;
          response.status = true;
          resolve(response);
        } else {
          console.log("Login failed User Blocked");
          response.loginErr = "User is Blocked";
          response.status = false;
          resolve(response);
        }
      } else {
        console.log("Login failed User not found");
        response.loginErr = "Invalid Phone Number";
        response.status = false;
        resolve(response);
      }
    });
  },
  OTPVerify: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phonenumber: userData });
      if (user) {
        if (!user.Blocked) {
          response.user = user;
          response.status = true;
          resolve(response);
        } else {
          console.log("Login failed User Blocked");
          response.loginErr = "User is Blocked";
          response.status = false;
          resolve(response);
        }
      } else {
        console.log("Login failed User not found");
        response.loginErr = "Invalid Phone Number";
        response.status = false;
        resolve(response);
      }
    });
  },
  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(userId) },
          {
            $set: {
              Blocked: true,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  unblockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(userId) },
          {
            $set: {
              Blocked: false,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  addToCart: (productId, userId) => {
    let productObj = {
      item: ObjectId(productId),
      quantity: 1,
    }

    return new Promise(async(resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) });
      if (userCart) {
        let productExists = userCart.products.findIndex(product => product.item == productId)
        if (productExists != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne({user: ObjectId(userId), 'products.item': ObjectId(productId) }, {
            $inc:{'products.$.quantity': 1}
          }).then(() => {
            resolve()
          })
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, {
              $push:{products: productObj}
          }).then((response) => {
            resolve(response)
          })
        }
        // db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, {
         
        //     $push:{products: productObj}
          
        // }).then((response) => {
        //   resolve(response)
        // })
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products : [productObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve(response)
        })
      }
    })
  },getCartProducts: (userId) => {
    return new Promise(async(resolve, reject) => {
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
      resolve(cartItems)
    })
  },
};
