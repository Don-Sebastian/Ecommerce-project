const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    Name: {
      type: String,
    },
    Price: {
      type: NUmber,
    },
    Category: {
      type: String,
    },
    Description: {
      type: String,
    },
    Description: {
      type: String,
    },
    Image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema)
module.exports = Product