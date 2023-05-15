const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createVideo,
  getVideoById,
  deleteVideoById,
  getVideos,
  updateVideo,
} = require("../controllers/video");

router.post(
  "/video/create",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  createVideo
);

router.get("/video/:id", getVideoById);
router.post("/video/getvideos", getVideos);

router.post(
  "/video/delete",
  requireSignin,
  adminMiddleware,
  deleteVideoById
);

router.patch(
  "/video/update",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  updateVideo
);

module.exports = router;
