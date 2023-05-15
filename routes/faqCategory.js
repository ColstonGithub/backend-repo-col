const express = require("express");
const router = express.Router();

const {
    addFaqCategory,
    getFaqCategories,
    deleteFaqCategory,
    updateFaqCategory,
    getFaqCategoryById
} = require("../controllers/faqCategory");

const {
    requireSignin,
    adminMiddleware,
  } = require("../common-middleware");

  router.post(
    "/faqcategory/create",
    requireSignin,
    adminMiddleware,
    addFaqCategory
  );

  router.get("/faqcategory/getfaqcategory", getFaqCategories);

  router.get("/faqcategory/getfaqcategory/:id", getFaqCategoryById);
  
  router.patch(
    "/faqcategory/update",
    requireSignin,
    adminMiddleware,
    updateFaqCategory
  );
  
  router.post(
    "/faqcategory/delete",
    requireSignin,
    adminMiddleware,
    deleteFaqCategory
  );
  
  module.exports = router;
  

