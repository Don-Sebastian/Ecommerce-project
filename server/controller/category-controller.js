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
    console.log(req.body);
    let admin = req.session.admin;
    if (req.session.admin) {
      categoryHelper.addCategory(req.body);
    //   res.render("admin/view-category", {
    //     adminAccount: true,
    //     scrollbar: true,
    //     CategoryAdded: true, admin
        // });
        req.session.categoryAdded = true;
        res.redirect("/admin/admin-categories");
      
    } else {
      res.render("admin/admin-login", {
        adminAccount: true,
        adminloginErr: req.session.adminloginErr,
        scrollbar: false,
      });
      req.session.adminloginErr = false;
    }
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
  if (req.session.admin) {
    
    categoryHelper.updateCategoryreq(id, req.body).then(() => {
      res.redirect("/admin/admin-categories");
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
      res.render('users/view-categoryProducts' ,{navbar: true, products})
    })
}