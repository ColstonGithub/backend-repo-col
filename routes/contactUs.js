const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
} = require("../common-middleware");

const {
  createContactUs,
  getContactUsById,
  deleteContactUsById,
  getContactUs,
  updateContactUs,
} = require("../controllers/contactUs");

router.post(
  "/contactus/create",
  createContactUs
);

router.get("/contactus/:id", getContactUsById);
router.post(
  "/contactus/getcontactus",
  getContactUs
);

router.post(
  "/contactus/delete",
  requireSignin,
  adminMiddleware,
  deleteContactUsById
);

router.patch(
  "/contactus/update",
  requireSignin,
  adminMiddleware,
  updateContactUs
);

module.exports = router;
