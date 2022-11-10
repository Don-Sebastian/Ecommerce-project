const fs = require("fs");

const categoryHelper = require("../../helpers/category-helpers");

var id;

exports.getCategory = (req, res) => {
  let admin = req.session.admin;
  if (req.session.admin) {
    categoryHelper.getAllCategories().then((categories) => {
      res.render("admin/view-category", {
        adminAccount: true,
        scrollbar: true,
        categories,
        admin,
        CategoryAdded: req.session.categoryAdded,
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
  categoryHelper.getAllCategories().then((categories) => {
    res.render("admin/view-sub-category", {
      adminAccount: true,
      scrollbar: true,
      categories,
      admin,
      CategoryAdded: req.session.categoryAdded,
    });
  })
};

exports.postAddSubCategory = (req, res) => {
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
  console.log("999999999999999999999999999999999",id);
  res.redirect("/admin/edit_sub_category");
};;

exports.getEditSubCategory = async (req, res) => {
  let subcategory = await categoryHelper.getSubCategoryDetails(id);
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

exports.getUserCategoryDetailID = async(req, res) => {
  
    id = req.params.id;
    res.redirect("/categoryProducts");
  
  
};

exports.getUserCategoryDetail = async(req, res) => {
  let user = req.session.user;
  cartCount = null;
  if (req.session.user) {
    cartCount =await cartHelper.getCartCount(req.session.user._id);
  }
  categoryHelper.getCategoryProducts(id).then((products) => {
    res.render("users/view-categoryProducts", {
      adminAccount: false,
      navbar: true,
      products,
      user,
      cartCount,
    });
  });
};
