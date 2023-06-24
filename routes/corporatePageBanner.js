const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createCorporatePageBanner,
  getCorporatePageBannerById,
  deleteCorporatePageBannerById,
  getCorporatePageBanners,
  updateCorporatePageBanner,
} = require("../controllers/corporatePageBanner");

router.post(
  "/corporatepagebanner/create",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  createCorporatePageBanner
);

router.get("/corporatepagebanner/:id", getCorporatePageBannerById);
router.post(
  "/corporatepagebanner/getcorporatepagebanners",
  getCorporatePageBanners
);

router.post(
  "/corporatepagebanner/delete",
  requireSignin,
  adminMiddleware,
  deleteCorporatePageBannerById
);

router.patch(
  "/corporatepagebanner/update",
  requireSignin,
  adminMiddleware,

  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
  updateCorporatePageBanner
);

module.exports = router;
