const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createCareer,
  getCareerById,
  deleteCareerById,
  getCareer,
  updateCareer,
} = require("../controllers/career");

router.post(
  "/career/create",
  upload.single("pdf"),
  createCareer
);

router.get("/career/:id", getCareerById);
router.post(
  "/career/getcareer",
  getCareer
);

router.post(
  "/career/delete",
  requireSignin,
  adminMiddleware,
  deleteCareerById
);

router.patch(
  "/career/update",
  requireSignin,
  adminMiddleware,
  upload.single("pdf"),
  updateCareer
);

module.exports = router;
