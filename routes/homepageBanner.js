const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createBanner,
  getBannerById,
  getBannersBySlug,
  deleteBannerById,
  getBanners,
  updateBanner,
} = require("../controllers/homepageBanner");

router.post(
  "/banner/create",
  requireSignin,
  adminMiddleware,
  upload.single("banner"),
  //upload.array("banner"),
  createBanner
);

router.get("/banner/:id", getBannerById);

router.get("/banners/:slug", getBannersBySlug);

router.post(
  "/banner/deleteBannerById",
  requireSignin,
  adminMiddleware,
  deleteBannerById
);

router.post("/banner/getBanners", getBanners);

router.patch(
  "/banner/update",
  requireSignin,
  adminMiddleware,
  upload.single("banner"),
  updateBanner
);

module.exports = router;
