const express = require("express");
//const {  } = require('../controller/category');
const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createSlider,
  getSliderById,
  getSlidersBySlug,
  deleteSliderById,
  getSliders,
} = require("../controllers/slider");


const router = express.Router();


router.post(
  "/slider/create",
  requireSignin,
  // uploadS3.array("productPicture"),
  upload.array('slider'),
  createSlider
);

router.get("/slider/:id", getSliderById);
router.get("/sliders/:slug", getSlidersBySlug);
router.delete(
  "/slider/deletesliderById",
  requireSignin,
  adminMiddleware,
  deleteSliderById
 );
router.post(
  "/slider/getsliders",
  requireSignin,
  getSliders
);

module.exports = router;




