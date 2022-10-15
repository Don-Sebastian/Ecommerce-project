var db = require("../config/connection");
var collection = require("../config/collections");

module.exports = {
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db
                .get()
                .collection(collection.CATEGORY_COLLECTION)
                .find()
                .toArray();
            resolve(categories);
        })
    },
}