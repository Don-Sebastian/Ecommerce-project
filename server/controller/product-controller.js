var productHelper = require("../../helpers/product-helpers");
const multer = require("../middleware/multer");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

exports.getAddProducts = (req, res) => {
  res.render("admin/add-products", { adminAccount: true, scrollbar: true });
};

exports.postAddProducts = (req, res, next) => {
  // console.log(req.body);
  // console.log(req.file.filename);
console.log("000000000000000");
// console.log(req.file.filename);
  // const files = req.files;
  console.log(req.files);

  if (!files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }

  // res.json(files);

  // console.log(req.body);

  // console.log(req.file);

  // let uploadFile = new UploadFile({ img: req.file.filename });
  productHelper.addProduct(req.body, (id) => {
    // console.log(id);
    console.log("999999999");
    console.log(req.body);
    
    console.log(store.filename);

    // console.log(req.files.Image);
    res.render("admin/add-products", {
      adminAccount: true,
      scrollbar: true,
    });
  });
};
