var productHelper = require("../../helpers/product-helpers");
const {  } = require("../middleware/multer");
const fs = require("fs");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

var id;

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
    
    productHelper.addProduct(req.body)
    res.render("admin/add-products", {
          adminAccount: true,
          scrollbar: true,
          productAdded: true, 
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


exports.getEditProductID = (req, res) => {

  let admin = req.session.admin;
  id = req.params.id 
  res.redirect('/admin/edit_Product')
 
};


exports.getEditProduct = async(req, res) => {
  let product = await productHelper.getProductDetails(id);
  
  res.render("admin/edit_product", {
    adminAccount: true,
    scrollbar: true,
    product
    
  })
};

exports.postEditProduct = (req, res) => {

  if (req.session.admin) {

    const files = req.files;
    const file = files.map((file) => {
      return file;
    });
    const fileName = file.map((file) => {
      return file.filename;
    });
    const productedit = req.body;
    productedit.Image = fileName;


    if (!req.files) {
      const error = new Error("Please choose files");
      error.httpStatusCode = 400;
      return next(error);
    }

    productHelper.updateProductreq(id, productedit).then(() => {
      res.redirect("/admin/view-products");
    });
  } else {
    res.render("admin/admin-login", {
      adminAccount: true,
      adminloginErr: req.session.adminloginErr,
      scrollbar: false,
    });
    req.session.adminloginErr = false;
  }
};