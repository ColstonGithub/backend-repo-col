const express = require("express");
const router = express.Router();

const {
  addBlogs,
  getBlogsDetailsById,
  deleteBlogsById,
  getBlogs,
  updateBlogs,
  getBlogsByCategoryId
} = require("../controllers/blogs");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
  //upload
} = require("../common-middleware");

router.post(
  "/blogs/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  addBlogs
);

router.get("/blogs/getblogs", getBlogs);
router.get("/blogs/:id", getBlogsDetailsById);

router.patch(
  "/blogs/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateBlogs
);

router.post("/blogs/getblogs/categoryid", getBlogsByCategoryId);

router.post(
  "/blogs/delete",
  requireSignin,
  adminMiddleware,
  deleteBlogsById
);

module.exports = router;
