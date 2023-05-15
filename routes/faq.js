const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
} = require("../common-middleware");

const {
  createFaq,
  getFaqById,
  deleteFaqById,
  getFaqs,
  updateFaq,
  getFaqsByCategoryId,
  getSearchFaq
} = require("../controllers/faq");

router.post(
  "/faq/create",
  requireSignin,
  adminMiddleware,
  createFaq
);

router.get("/faq/:id", getFaqById);
router.post(
  "/faq/getfaqs",
  getFaqs
);
router.post("/faq/getfaqs/categoryid", getFaqsByCategoryId);

router.post("/faq/getsearchfaq", getSearchFaq);

router.post(
  "/faq/delete",
  requireSignin,
  adminMiddleware,
  deleteFaqById
);

router.patch(
  "/faq/update",
  requireSignin,
  adminMiddleware,
  updateFaq
);

module.exports = router;
