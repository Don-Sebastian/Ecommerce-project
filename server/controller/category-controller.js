const categoryHelper = require('../../helpers/category-helpers')

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
        })
    } else {
        res.render("admin/admin-login", {
        adminAccount: true,
        adminloginErr: req.session.adminloginErr,
        scrollbar: false,
        });
        req.session.adminloginErr = false;
    }
}

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
  res.redirect("/admin/admin-categories")
}


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
  categoryHelper.deleteCategory(categoryId).then(() => {
    res.redirect("/admin/admin-categories");
  });
};


exports.getUserCategoryDetailID = (req, res) => {
  id = req.params.id;
  res.redirect("/get-CategoryProducts");
};

exports.getUserCategoryDetail = (req, res) => {
  categoryHelper.getCategoryProducts(id).then((products) => {
      res.render("users/view-categoryProducts", {
        adminAccount: false,
        navbar: true,
        products,
        cartCount,
      });
    })
}