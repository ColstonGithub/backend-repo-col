const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createCataloguePageBanner,
  getCataloguePageBannerById,
  deleteCataloguePageBannerById,
  getCataloguePageBanners,
  updateCataloguePageBanner,
} = require("../controllers/cataloguePageBanner");

router.post(
  "/cataloguepagebanner/create",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 1 },
  ]),
  createCataloguePageBanner
);

router.get("/cataloguepagebanner/:id", getCataloguePageBannerById);
router.post(
  "/cataloguepagebanner/getcataloguepagebanners",
  getCataloguePageBanners
);

router.delete(
  "/cataloguepagebanner/delete",
  requireSignin,
  adminMiddleware,
  deleteCataloguePageBannerById
);

router.patch(
  "/cataloguepagebanner/update",
  requireSignin,
  adminMiddleware,

  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 1 },
  ]),
  updateCataloguePageBanner
);

module.exports = router;
