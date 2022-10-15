var userHelper = require("../../helpers/user-helpers");
var productHelper = require("../../helpers/product-helpers");

const {} = require("../middleware/multer");
const fs = require("fs");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");

var id;


exports.getblockUser = (req, res) => {
  let userId = req.params.id;
  console.log(userId);
  userHelper.blockUser(userId).then(() => {
    res.redirect("/admin/view-users");
  });
};

exports.getUnblockUser = (req, res) => {
  let userId = req.params.id;
  console.log(userId);
  userHelper.unblockUser(userId).then(() => {
    res.redirect("/admin/view-users");
  });
};

exports.getAllProducts = function (req, res, next) {
  let user = req.session.user;
  // if (req.session.user) {
      productHelper.getAllProducts().then((products) => {
          res.render("users/home", {
              title: "Fadonsta",
              navbar: true,
              user,
              products
          });
      });  
   
  // } else {
  //   res.render("users/user-login", {
  //     loginErr: req.session.userloginErr,
  //     navbar: false,
  //   });
  //   req.session.userloginErr = false;
  // }
}

// --------------------------------------Product Details---------------------------------------

exports.getProductDetailID = (req, res) => {
  id = req.params.id;
  res.redirect('/product-details')
};

exports.getProductDetails = (req, res) => {
  let user = req.session.user;
  if (req.session.user) {
    productHelper.getProductDetails(id).then((product) => {
      res.render("users/product-details", {
        title: "Fadonsta",
        navbar: true,
        user,
        product,
      });
    });
  } else {
    res.render("users/user-login", {
      loginErr: req.session.userloginErr,
      navbar: false,
    });
    req.session.userloginErr = false;
  }
};
  


