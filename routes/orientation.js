const express = require("express");
const router = express.Router();

const {
  addOrientationCenter,
  getOrientationCenterDetailsById,
  deleteOrientationCenterById,
  getOrientationCenters,
  updateOrientationCenter,
} = require("../controllers/orientation");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
} = require("../common-middleware");

router.post(
  "/orientationCenter/create",
  requireSignin,
  adminMiddleware,
  addOrientationCenter
);

router.get("/orientationCenter/getOrientationCenters", getOrientationCenters);
router.get(
  "/orientationCenter/:orientationCenterById",
  getOrientationCenterDetailsById
);

router.patch(
  "/orientationCenter/update",
  requireSignin,
  adminMiddleware,
  updateOrientationCenter
);

router.post(
  "/orientationCenter/delete",
  requireSignin,
  adminMiddleware,
  deleteOrientationCenterById
);

module.exports = router;
