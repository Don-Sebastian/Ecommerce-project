const categoryHelper = require('../../helpers/category-helpers')

exports.getCategory = (req, res) => {

    let admin = req.session.admin;
    if (req.session.admin) {
        categoryHelper.getAllCategories().then((categories) => {
            res.render("admin/view-category", { adminAccount: true, scrollbar: true, categories, admin });
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
