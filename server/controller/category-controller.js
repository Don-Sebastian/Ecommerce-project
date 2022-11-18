const { ObjectID } = require("bson");
const fs = require("fs");

const categoryHelper = require("../../helpers/category-helpers");
const cartHelper = require("../../helpers/cart-helpers");
const productHelpers = require("../../helpers/product-helpers");

var id;

exports.getCategory = (req, res) => {
  let admin = req.session.admin;
  CategoryAdded = req.session.categoryAdded;
  req.session.categoryAdded = false; 
  if (req.session.admin) {
    categoryHelper.getAllCategories().then((categories) => {
      res.render("admin/view-category", {
        adminAccount: true,
        scrollbar: true,
        categories,
        admin,
        CategoryAdded,
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
};

exports.getSubCategory = (req, res) => {

  CategoryAdded = req.session.categoryAdded;
  req.session.categoryAdded = false; 

  categoryHelper.getAllCategories().then((categories) => {
    res.render("admin/view-sub-category", {
      adminAccount: true,
      scrollbar: true,
      categories,
      admin,
      CategoryAdded,
    });
  })
};

exports.postAddSubCategory = (req, res) => {
  categoryHelper.addSubCategory(req.body);
  req.session.subCategoryAdded = true;
  res.redirect("/admin/admin-sub-categories");
};


exports.postAddCategory = (req, res) => {
  const files = req.files;
  const file = files.map((file) => {
    return file;
  });
  const fileName = file.map((file) => {
    return file.filename;
  });
  const category = req.body;
  category.CategoryImage = fileName;

  if (!req.files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }

  categoryHelper.addCategory(req.body);
  req.session.categoryAdded = true;
  res.redirect("/admin/admin-categories");
};

//EDIT SUBCATEGORY
exports.getEditSubCategoryID = (req, res) => {

  id = req.params.id;
  res.redirect("/admin/edit_sub_category");
};;

exports.getEditSubCategory = async (req, res) => {
  let subcategory = await categoryHelper.getSubCategoryDetails(id);
  console.log(".....................", subcategory);
  res.render("admin/edit-sub-category", {
    adminAccount: true,
    scrollbar: true,
    subcategory,
  });
};;

exports.getEditCategoryID = (req, res) => {
  id = req.params.id;
  res.redirect("/admin/edit_Category");
};

exports.getEditCategory = async (req, res) => {
  
  let category = await categoryHelper.getCategoryDetails(id);
  res.render("admin/edit-category", {
    adminAccount: true,
    scrollbar: true,
    category,
  });
};

exports.postEditCategory = (req, res) => {
  const files = req.files;
  const file = files.map((file) => {
    return file;
  });
  const fileName = file.map((file) => {
    return file.filename;
  });
  const category = req.body;
  category.CategoryImage = fileName;

  if (!req.files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }

  categoryHelper.updateCategoryreq(id, req.body).then(() => {
    res.redirect("/admin/admin-categories");
  });
};

exports.getDeleteCategory = (req, res) => {
  let categoryId = req.params.id;
  categoryHelper.deleteCategory(categoryId).then((delCategory) => {
    // fs.unlink("/uploads/category/", (err) => {
    //   if (err) console.log(err);
    //   else {
    //     console.log("\nDeleted file: example_file.txt");
    //   }
    // });
    res.redirect("/admin/admin-categories");
  });
};

exports.getDeleteSubCategory = (req, res) => {
  categoryHelper.deleteSubCategory(req.params.id).then(() => {
    res.redirect("/admin/admin-sub-categories");
  })
};

exports.postEditSubCategory = (req, res) => {
  categoryHelper.updateSubCategoryreq(req.params.id, req.body).then(() => {
    res.redirect("/admin/admin-sub-categories");
  });
};

exports.removeImageCategory = (req, res) => {
  fs.unlink("/uploads/category/" + req.imageName, (err) => {
    if (err) console.log(err);
    else {
      console.log("\nDeleted file: " + req.imageName);
      
    }
  });
};

exports.getUserCategoryDetailID = async(req, res) => {
  
    id = req.params.id;
    res.redirect("/categoryProducts");
  
  
};

exports.getUserCategoryDetail = async(req, res) => {
  let user = req.session.user;
  let products = null;
  cartCount = null;
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id);
  }
    let categoryDetails = await categoryHelper.getCategoryDetails(id);
  console.log("..........", categoryDetails);
  if (categoryDetails === null) {
    let subcategoryDetails = await categoryHelper.getSubCategoryDetails(id)
    subcategoryDetails = subcategoryDetails[0].subCategory;
    categoryDetails = await categoryHelper.getCategoryDetailsbyName(subcategoryDetails.CategoryName);
    products = await productHelpers.getSubCategoryProducts(subcategoryDetails)
  } else {
    products = await categoryHelper.getCategoryProducts(id);
  }
      res.render("users/view-categoryProducts", {
        adminAccount: false,
        navbar: true,
        categoryDetails,
        products,
        user,
        cartCount,
      });
};


exports.postCategorySubcategory = (req, res) => {
  categoryHelper.categorySubcategory(req.body).then((response) => {
    res.json(response);
  });
};