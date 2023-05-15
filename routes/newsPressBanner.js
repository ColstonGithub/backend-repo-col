const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createNewsPressBanner,
  getNewsPressBannerById,
  deleteNewsPressBannerById,
  getNewsPressBanners,
  updateNewsPressBanner,
} = require("../controllers/newsPressBanner");

router.post(
  "/newspressbanner/create",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
  createNewsPressBanner
);

router.get("/newspressbanner/:id", getNewsPressBannerById);
router.post("/newspressbanner/getnewspressbanners", getNewsPressBanners);

router.post(
  "/newspressbanner/delete",
  requireSignin,
  adminMiddleware,
  deleteNewsPressBannerById
);

router.patch(
  "/newspressbanner/update",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
  updateNewsPressBanner
);

module.exports = router;
