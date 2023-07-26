const express = require("express");
const router = express.Router();

const {
  addExhibitionProduct,
  getExhibitionProductDetailsById,
  deleteExhibitionProducttById,
  getExhibitionProducts,
  updateExhibitionProduct,
} = require("../controllers/exhibitionProduct");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
} = require("../common-middleware");

router.post(
  "/exhibitionproduct/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  addExhibitionProduct
);

router.get("/exhibitionproduct/getexhibitionproducts", getExhibitionProducts);
router.get(
  "/exhibitionproduct/:exhibitionproductId",
  getExhibitionProductDetailsById
);

router.patch(
  "/exhibitionproduct/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateExhibitionProduct
);

router.post(
  "/exhibitionproduct/delete",
  requireSignin,
  adminMiddleware,
  deleteExhibitionProducttById
);

module.exports = router;
