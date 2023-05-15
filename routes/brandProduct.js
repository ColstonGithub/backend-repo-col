const express = require("express");
const router = express.Router();

const {
  addbrandProduct,
  getbrandProductDetailsById,
  deletebrandProducttById,
  getBrandProducts,
  updateBrandProduct,
} = require("../controllers/brandProduct");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
} = require("../common-middleware");

router.post(
  "/brandproduct/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  addbrandProduct
);

router.get("/brandproduct/getbrandproducts", getBrandProducts);
router.get("/brandproduct/:brandproductId", getbrandProductDetailsById);

router.patch(
  "/brandproduct/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateBrandProduct
);

router.post(
  "/brandproduct/delete",
  requireSignin,
  adminMiddleware,
  deletebrandProducttById
);

module.exports = router;
