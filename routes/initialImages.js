const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createInitialImage,
  getInitialImages,
} = require("../controllers/initialImages");

router.post(
  "/initialImage/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  createInitialImage
);

router.get("/initialImage/getInitialImages", getInitialImages);

module.exports = router;
