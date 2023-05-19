const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createCategoryBanner,
  getCategoryBannerById,
  getCategoryBannersBySlug,
  deleteCategoryBannerById,
  getCategoryBanners,
  updateCategoryBanner,
} = require("../controllers/categoryBanner");

router.post(
  "/categorybanner/create",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  createCategoryBanner
);

router.get("/categorybanner/:id", getCategoryBannerById);

router.get("/categorybanner/:slug", getCategoryBannersBySlug);

router.post(
  "/categorybanner/delete",
  requireSignin,
  adminMiddleware,
  deleteCategoryBannerById
);

router.post("/categorybanner/getcategorybanners", getCategoryBanners);

router.patch(
  "/categorybanner/update",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  updateCategoryBanner
);

module.exports = router;
