const express = require("express");
const router = express.Router();

const {
  addCategory,
  getCategories,
  deleteCategories,
  updateCategories,
  getCategoriesById,
  getSubCategories,
  updateOrder,
} = require("../controllers/category");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
} = require("../common-middleware");

router.post(
  "/category/create",
  requireSignin,
  adminMiddleware,
  upload.single("categoryImage"),
  addCategory
);

router.get("/category/getcategory", getCategories);

router.get("/category/getcategory/:id", getCategoriesById);

router.post("/category/id/children", getSubCategories);

router.patch(
  "/category/update",
  requireSignin,
  adminMiddleware,
  upload.single("categoryImage"),
  updateCategories
);

router.patch("/category/updateOrder", updateOrder);

router.post(
  "/category/delete",
  requireSignin,
  adminMiddleware,
  deleteCategories
);

module.exports = router;
