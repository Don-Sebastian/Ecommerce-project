var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

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
      if (!user.Blocked) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login failed User not found");
        resolve({ status: false });
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
      if (!user.Blocked) {
        // let status = true;
        response.user = user;
        response.status = true;
        resolve(response);
      } else {
        console.log("Login failed User not found");
        resolve({ status: false });
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
};
