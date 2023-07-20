const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
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
  upload.single("image"),
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
  upload.single("image"),
  updateWarrentyRegistration
);

module.exports = router;
