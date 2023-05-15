const express = require("express");
const router = express.Router();

const {
    addBlogCategory,
    getBlogCategories,
    deleteBlogCategory,
    updateBlogCategory,
    getBlogCategoryById
} = require("../controllers/blogsCategory");

const {
    requireSignin,
    adminMiddleware,
  } = require("../common-middleware");

  router.post(
    "/blogcategory/create",
    requireSignin,
    adminMiddleware,
    addBlogCategory
  );

  router.get("/blogcategory/getblogcategory", getBlogCategories);

  router.get("/blogcategory/getblogcategory/:id", getBlogCategoryById);
  
  router.patch(
    "/blogcategory/update",
    requireSignin,
    adminMiddleware,
    updateBlogCategory
  );
  
  router.post(
    "/blogcategory/delete",
    requireSignin,
    adminMiddleware,
    deleteBlogCategory
  );
  
  module.exports = router;
  

