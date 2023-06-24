const jwt = require("jsonwebtoken");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint("https://sgp1.digitaloceanspaces.com"),
  // Replace with your DigitalOcean Spaces endpoint
  accessKeyId: "DO00DRWTB9KLHRDV4HCB", // Replace with your DigitalOcean Spaces access key ID
  secretAccessKey: "W2Ar0764cy4Y7rsWCecsoZxOZ3mJTJoqxWBo+uppV/c", // Replace with your DigitalOcean Spaces secret access key
});

// Set storage engine
const storage = multer.memoryStorage(); // Store files in memory for uploading to Spaces

const uploadField = multer({ storage: storage }).fields([
  { name: "pdf", maxCount: 1 },
  { name: "image", maxCount: 10 },
]);

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
  uploadField,
};
