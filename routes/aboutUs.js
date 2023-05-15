const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createAboutUs,
  getAboutUsById,
  deleteAboutUsById,
  getAboutUs,
  updateAboutUs,
} = require("../controllers/aboutUs");

router.post(
  "/aboutus/create",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
  createAboutUs
);

router.get("/aboutus/:id", getAboutUsById);
router.post("/aboutus/getaboutus", getAboutUs);

router.post(
  "/aboutus/delete",
  requireSignin,
  adminMiddleware,
  deleteAboutUsById
);

router.patch(
  "/aboutus/update",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
  updateAboutUs
);

module.exports = router;
