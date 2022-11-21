// const bcrypt = require("bcrypt");
module.exports = {
  doAdminLogin: (adminData) => {
    const admin = { Name: 'admin', Email: 'admin@gmail.com', Password: '1233' };

    // eslint-disable-next-line no-async-promise-executor, no-unused-vars
    return new Promise(async (resolve, reject) => {
      const response = {};
      if (adminData.Email === admin.Email) {
        //   bcrypt.compare(adminData.Password, admin.Password).then((status) => {
        if (adminData.Password === admin.Password) {
          // eslint-disable-next-line no-console
          console.log('Login success');
          response.admin = admin;
          response.adminstatus = true;
          resolve(response);
        } else {
          // eslint-disable-next-line no-console
          console.log('Login failed');
          response.adminloginErr = 'Invalid Password';
          response.adminstatus = false;
          resolve(response);
        }
        //   });
      } else {
        // eslint-disable-next-line no-console
        console.log('Login failed User not found');
        response.adminloginErr = 'Invalid Email ID';
        response.adminstatus = false;
        resolve(response);
      }
    });
  },
};
