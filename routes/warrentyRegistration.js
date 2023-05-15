const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
} = require("../common-middleware");

const {
  createWarrentyRegistration,
  getWarrentyRegistrationById,
  deleteWarrentyRegistrationById,
  getWarrentyRegistration,
  updateWarrentyRegistration,
} = require("../controllers/warrentyRegistration");

router.post(
  "/warrentyregistration/create",
  createWarrentyRegistration
);

router.get("/warrentyregistration/:id", getWarrentyRegistrationById);
router.post(
  "/warrentyregistration/getwarrentyregistration",
  getWarrentyRegistration
);

router.post(
  "/warrentyregistration/delete",
  requireSignin,
  adminMiddleware,
  deleteWarrentyRegistrationById
);

router.patch(
  "/warrentyregistration/update",
  requireSignin,
  adminMiddleware,
  updateWarrentyRegistration
);

module.exports = router;
