const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createExhibition,
  getExhibitionById,
  deleteExhibitionById,
  getExhibitions,
  updateExhibition,
} = require("../controllers/exhibition");

router.post(
  "/exhibition/create",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  createExhibition
);

router.get("/exhibition/:id", getExhibitionById);
router.post("/exhibition/getexhibitions", getExhibitions);

router.post(
  "/exhibition/delete",
  requireSignin,
  adminMiddleware,
  deleteExhibitionById
);

router.patch(
  "/exhibition/update",
  requireSignin,
  adminMiddleware,
  upload.single("bannerImage"),
  updateExhibition
);

module.exports = router;
