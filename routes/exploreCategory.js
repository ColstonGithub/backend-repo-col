const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createExploreCategory,
  getExploreCategoryById,
  deleteExploreCategoryById,
  getExploreCategory,
  updateExploreCategory,
} = require("../controllers/exploreCategory");

router.post(
  "/explorecategory/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  createExploreCategory
);

router.get("/explorecategory/:id", getExploreCategoryById);

router.post(
  "/explorecategory/delete",
  requireSignin,
  adminMiddleware,
  deleteExploreCategoryById
);

router.post("/explorecategory/getexplorecategory", getExploreCategory);

router.patch(
  "/explorecategory/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateExploreCategory
);

module.exports = router;
