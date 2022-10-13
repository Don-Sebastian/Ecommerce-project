var productHelper = require("../../helpers/product-helpers");
const multer = require("../middleware/multer");
const fs = require("fs");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

exports.getAddProducts = (req, res) => {
  let admin = req.session.admin;
  if (req.session.admin) {
    res.render("admin/add-products", { adminAccount: true, scrollbar: true });
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
};






exports.postAddProducts = (req, res, next) => {
  let admin = req.session.admin;
  if (req.session.admin) {

    // store(req, res, function (err) {
    //   if (err) {
    //     console.log("Something went wrong!");
    //   }

    //   console.log("File uploaded sucessfully!.");
    // });
    // res.send(req.files);

    const files = req.files;
    const file = files.map((file) => {
      return file;
    });
    const fileName = file.map((file) => {
      return file.filename;
    });
    const product = req.body;
    product.Image = fileName;


    if (!req.files) {
      const error = new Error("Please choose files");
      error.httpStatusCode = 400;
      return next(error);
    }
    // console.log(req.body);
    // console.log(req.file.filename);
    console.log("000000000000000");
    // console.log(req.file.filename);
    // const files = req.files;
    console.log(req.files);
  
 

    // res.json(files);

    // console.log(req.body);

    // console.log(req.file);

    // let uploadFile = new UploadFile({ img: req.file.filename });
    productHelper.addProduct(req.body,
      // req.files[0].filename,
      (id) => {
      
        console.log("*/*/*/*/*/***/*/*/*/*/*///**");
        console.log(id);
        console.log("999999999");
        console.log(req.body);
        console.log(req.body.fname);
        console.log("565656565556565656565");
        console.log(req.body._id);
        // console.log(req.files[0].filename);
        // console.log(req.files[0].path);

        // console.log(req.files.Image);
        res.render("admin/add-products", {
          adminAccount: true,
          scrollbar: true,
        });
      });
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
}