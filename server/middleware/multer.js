const multer = require("multer");


//defining storage for the image

const storage = multer.diskStorage({
  //destinations for files
  destination: function (req, file,  callback) {
    callback(null, "public/admin/uploads");
  },

  //add back the file extension
  filename: function (req, file,  callback) {
      let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
      // let filename = req.body._id;
      // console.log("*****************");
      // console.log(req.body.fname);
        //   ObjectId("507c7f79bcf86cd7994f6c0e").valueOf();
    // var ImageName = filename;
    
      callback(
        null,
        file.originalname + "-" + Date.now() + ext
        // req.body.fname
      );
  },
});

//upload parameters for multer
store = multer({
  storage: storage,
  //   limits: {
  //     fieldSize: 1024 * 1024 * 5
  //   },
})
// module.exports.ImageName = ImageName;
module.exports = store;
