/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectID } = require('bson');
const { v4: uuidv4 } = require('uuid');
const collection = require('../config/collections');
const db = require('../config/connection');

module.exports = {
  doSignup: (userData) => new Promise(async (resolve, reject) => {
    const response = {};
    const userDetailID = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ Email: userData.Email });
    if (userDetailID) {
      resolve({ userExist: true });
    } else {
      if (userData.ReferalCode) {
        const referedUser = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ ReferalCode: userData.ReferalCode });
        const referalAmount = parseInt(200, 10);
        if (referedUser) {
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { ReferalCode: userData.ReferalCode },
              {
                $inc: { Wallet: referalAmount },
              },
            );
          userData.Wallet = parseInt(150, 10);
        } else {
          resolve({ invalidReferalCode: true });
        }
      } else {
        userData.Wallet = parseInt(100, 10);
      }
      userData.Blocked = false;
      userData.Password = await bcrypt.hash(userData.Password, 10);
      userData.ReferalCode = uuidv4();

      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          response.userData = userData;
          response.userExist = false;
          resolve(response);
        });
    }
  }),

  doLogin: (userData) => new Promise(async (resolve, reject) => {
    const loginStatus = false;
    const response = {};
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ Email: userData.Email });
    if (user) {
      if (!user.Blocked) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            // eslint-disable-next-line no-console
            console.log('Login success');
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            // eslint-disable-next-line no-console
            console.log('Login failed');
            response.loginErr = 'Invalid Password';
            response.status = false;
            resolve(response);
          }
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('Login failed User Blocked');
        response.loginErr = 'User is Blocked';
        response.status = false;
        resolve(response);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('Login failed User not found');
      response.loginErr = 'Invalid Email ID';
      response.status = false;
      resolve(response);
    }
  }),

  getAllUsers: () => new Promise(async (resolve, reject) => {
    const userDetails = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .find()
      .toArray();
    resolve(userDetails);
  }),

  OTPLogin: (userData) => new Promise(async (resolve, reject) => {
    const loginStatus = false;
    const response = {};
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ phonenumber: userData.phonenumber });
    if (user) {
      if (!user.Blocked) {
        response.user = user;
        response.status = true;
        resolve(response);
      } else {
        // eslint-disable-next-line no-console
        console.log('Login failed User Blocked');
        response.loginErr = 'User is Blocked';
        response.status = false;
        resolve(response);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('Login failed User not found');
      response.loginErr = 'Invalid Phone Number';
      response.status = false;
      resolve(response);
    }
  }),
  OTPVerify: (userData) => new Promise(async (resolve, reject) => {
    const loginStatus = false;
    const response = {};
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ phonenumber: userData });
    if (user) {
      if (!user.Blocked) {
        response.user = user;
        response.status = true;
        resolve(response);
      } else {
        // eslint-disable-next-line no-console
        console.log('Login failed User Blocked');
        response.loginErr = 'User is Blocked';
        response.status = false;
        resolve(response);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('Login failed User not found');
      response.loginErr = 'Invalid Phone Number';
      response.status = false;
      resolve(response);
    }
  }),
  blockUser: (userId) => new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectID(userId) },
        {
          $set: {
            Blocked: true,
          },
        },
      )
      .then((response) => {
        resolve();
      });
  }),
  unblockUser: (userId) => new Promise(async (resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectID(userId) },
        {
          $set: {
            Blocked: false,
          },
        },
      )
      .then((response) => {
        resolve();
      });
  }),
  addAddress: (details) => {
    details._id = ObjectId();
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(details.userId) },
          {
            $push: {
              Address: details,
            },
          },
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAddress: (userId) => new Promise(async (resolve, reject) => {
    const addressDetail = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { _id: ObjectId(userId) },
        },
        {
          $project: { Address: 1, _id: 0 },
        },
        {
          $unwind: '$Address',
        },
      ])
      .toArray();
    resolve(addressDetail);
  }),
  getUserDetails: (userId) => new Promise(async (resolve, reject) => {
    const userDetails = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    resolve(userDetails);
  }),
  resetPassword: (passwordDetails, userId) => new Promise(async (resolve, reject) => {
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    if (user) {
      if (!user.Blocked) {
        bcrypt
          .compare(passwordDetails.Password, user.Password)
          .then(async () => {
            passwordDetails.nPassword = await bcrypt.hash(
              passwordDetails.nPassword,
              10,
            );
            await db
              .get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: ObjectId(userId) },
                {
                  $set: { Password: passwordDetails.nPassword },
                },
              )
              .then((response) => {
                resolve();
              })
              .catch((err) => {
                // eslint-disable-next-line no-console
                console.log(err);
                reject();
              });
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
          });
      }
    }
  }),
  editAddress: (addressId, userId) => new Promise(async (resolve, reject) => {
    const address = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { _id: ObjectId(userId) },
        },
        {
          $unwind: '$Address',
        },
        {
          $project: { _id: 0, Address: 1 },
        },
      ])
      .toArray();
    resolve(address);
  }),
  deleteAddress: (addressId, userId) => new Promise((resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(userId) },
        {
          $pull: { Address: { _id: ObjectId(addressId) } },
        },
      )
      .then((response) => {
        resolve(response);
      });
  }),
  walletAmount: (userId) => new Promise(async (resolve, reject) => {
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: ObjectId(userId) });
    const amount = parseInt(user.Wallet, 10);
    if (user.Wallet) {
      resolve(amount);
    }
  }),
  payUsingWallet: (userId, totalAmount) => new Promise((resolve, reject) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(userId) },
        {
          $inc: { Wallet: -totalAmount },
        },
      ).then(() => {
        resolve();
      });
  }),
};
