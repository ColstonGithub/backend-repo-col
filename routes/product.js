const express = require("express");
const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createProduct,
  getProductDetailsById,
  deleteProductById,
  getProducts,
  updateProduct,
  getProductsByCategoryId,
  getSearchProducts,
  getNewArrivalProducts,
  updateOrder,
} = require("../controllers/product");

const router = express.Router();

router.post(
  "/product/create",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "pdf", maxCount: 2 },
    { name: "productPicture", maxCount: 10 },
    { name: "colorPicture0", maxCount: 10 },
    { name: "colorPicture1", maxCount: 10 },
    { name: "colorPicture2", maxCount: 10 },
    { name: "colorPicture3", maxCount: 10 },
  ]),
  createProduct
);

router.get("/product/:productId", getProductDetailsById);

router.post(
  "/product/deleteProductById",
  requireSignin,
  adminMiddleware,
  deleteProductById
);

router.post("/product/getProducts", getProducts);

router.post("/product/getProducts/categoryid", getProductsByCategoryId);

router.post("/product/getnewarrival", getNewArrivalProducts);

router.post("/product/getsearchproducts", getSearchProducts);

router.patch("/product/updateOrder", updateOrder);

router.patch(
  "/product/update",
  requireSignin,
  adminMiddleware,
  // upload.array("productPicture"),
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "productPicture", maxCount: 10 },
    { name: "colorPicture0", maxCount: 10 },
    { name: "colorPicture1", maxCount: 10 },
    { name: "colorPicture2", maxCount: 10 },
  ]),
  updateProduct
);

module.exports = router;
