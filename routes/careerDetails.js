const express = require("express");

const router = express.Router();

const {
  addCareerDetails,
  getCareerDetailsById,
  deleteCareerDetailsById,
  getCareerDetails,
  updateCareerDetails,
} = require("../controllers/careerDetails");

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

router.post(
  "/careerDetails/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  addCareerDetails
);

router.get("/careerDetails/getCareerDetails", getCareerDetails);

router.get("/careerDetails/:id", getCareerDetailsById);

router.patch(
  "/careerDetails/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateCareerDetails
);

router.post(
  "/careerDetails/delete",
  deleteCareerDetailsById
);

module.exports = router;