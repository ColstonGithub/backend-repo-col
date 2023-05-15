const express = require("express");
const router = express.Router();

const {
  addCorporateProduct,
  getCorporateProductDetailsById,
  deleteCorporateProductById,
  getCorporateProducts,
  updateCorporateProduct,
} = require("../controllers/corporateProduct");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
  //upload
} = require("../common-middleware");

router.post(
  "/corporateproduct/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  addCorporateProduct
);

router.get("/corporateproduct/getcorporateproducts", getCorporateProducts);
router.get("/corporateproduct/:id", getCorporateProductDetailsById);

router.patch(
  "/corporateproduct/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateCorporateProduct
);

router.post(
  "/corporateproduct/delete",
  requireSignin,
  adminMiddleware,
  deleteCorporateProductById
);

module.exports = router;
