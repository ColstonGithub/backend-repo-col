const jwt = require("jsonwebtoken");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, callback) {
    callback(null, shortid.generate() + "-" + file.originalname);
  },
});
// Init multer
const upload = multer({ storage: storage });
// Set JWT Secret
const requireSignin = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
  } else {
    return res
      .status(400)
      .json({ message: "Authorization required use valid token" });
  }
  next();
};

exports.superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "super-admin") {
    return res.status(200).json({ message: "Super Admin access denied" });
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    if (req.user.role !== "super-admin") {
      return res.status(400).json({ message: "Admin access denied" });
    }
  }
  next();
};

module.exports = {
  requireSignin,
  adminMiddleware,
  upload,
};
