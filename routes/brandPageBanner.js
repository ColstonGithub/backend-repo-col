const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createBrandPageBanner,
  getBrandPageBannerById,
  deleteBrandPageBannerById,
  getBrandPageBanners,
  updateBrandPageBanner,
} = require("../controllers/brandPageBanner");

router.post(
  "/brandpagebanner/create",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  createBrandPageBanner
);

router.get("/brandpagebanner/:id", getBrandPageBannerById);

router.post(
  "/brandpagebanner/delete",
  requireSignin,
  adminMiddleware,
  deleteBrandPageBannerById
);

router.post("/brandpagebanner/getbrandpagebanners", getBrandPageBanners);

router.patch(
  "/brandpagebanner/update",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  updateBrandPageBanner
);

module.exports = router;
