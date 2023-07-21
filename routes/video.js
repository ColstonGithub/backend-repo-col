const express = require("express");
const router = express.Router();

const { getVideos } = require("../controllers/video");

router.get("/video/getvideos", getVideos);

module.exports = router;
