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
} = require("../controllers/initialImagesAdmin");

router.post(
  "/initialImageAdmin/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  createInitialImage
);

router.get("/initialImageAdmin/getInitialImagesAdmin", getInitialImages);

module.exports = router;
