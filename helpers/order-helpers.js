var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const { response } = require("express");

module.exports = {
    placeOrder: (order , products, total) => {
        return new Promise(async(resolve, reject) => {
            let status = order.paymentMethod === 'COD' ? 'placed' : 'pending'
            let address = await db
              .get()
                .collection(collection.USER_COLLECTION)
              .aggregate([
                {
                  $match: { _id: ObjectId(order.user) },
                },
                {
                  $unwind: { path: "$Address" },
                  },
                  {
                    $match: {"Address._id": {$in: [ObjectId(order.addressId)]}}
                  },
                  {
                      $project: {Address: 1, _id: 0}
                  }
              ])
                .toArray();
            let orderObj = {
              userId: ObjectId(order.user),
                deliveryDetails: address[0].Address,
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: total,
                status: status,
              Date: new Date(), 
            };
            
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.user) });
                resolve()
            })
        })
    }
}
