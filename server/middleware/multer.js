const multer = require("multer");

// handle storage using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/admin/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// handle storage using multer
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/admin/uploads/category");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload2 = multer({ storage: storage2 });
module.exports = {
  upload,
  upload2,
};
