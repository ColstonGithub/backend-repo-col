const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createVirtualTour,
  getVirtualTourById,
  deleteVirtualTourById,
  getVirtualTours,
  updateVirtualTour,
} = require("../controllers/virtualTour");

router.post(
  "/virtualtour/create",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  createVirtualTour
);

router.get("/virtualtour/:id", getVirtualTourById);
router.post("/virtualtour/getvirtualtours", getVirtualTours);

router.post(
  "/virtualtour/delete",
  requireSignin,
  adminMiddleware,
  deleteVirtualTourById
);

router.patch(
  "/virtualtour/update",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  updateVirtualTour
);

module.exports = router;
