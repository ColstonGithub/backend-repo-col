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
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
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
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "bannerImageText", maxCount: 10 },
  ]),
  updateExhibition
);

module.exports = router;
