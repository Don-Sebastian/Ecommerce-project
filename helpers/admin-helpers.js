const bcrypt = require("bcrypt");
module.exports = {
  doAdminLogin: (adminData) => {
    let admin = { Name: "admin", Email: "admin@gmail.com", Password: "1233" };

    return new Promise(async (resolve, reject) => {
      let response = {};
      if (adminData.Email == admin.Email) {
        //   bcrypt.compare(adminData.Password, admin.Password).then((status) => {
        if (adminData.Password == admin.Password) {
          // let status = true;
          console.log("Login success");
          response.admin = admin;
          response.adminstatus = true;
          resolve(response);
        } else {
          console.log("Login failed");
          resolve({ adminstatus: false });
        }
        //   });
      } else {
        console.log("Login failed User not found");
        resolve({ adminstatus: false });
      }
    });
  },
};
