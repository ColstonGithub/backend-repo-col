const express = require("express");
const router = express.Router();

const {
  addNewsPress,
  getNewsPressDetailsById,
  deleteNewsPressById,
  getNewsPress,
  updateNewsPress,
} = require("../controllers/newsPress");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
  //upload
} = require("../common-middleware");

router.post(
  "/newspress/create",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  addNewsPress
);

router.get("/newspress/getnewspress", getNewsPress);
router.get("/newspress/:id", getNewsPressDetailsById);

router.patch(
  "/newspress/update",
  requireSignin,
  adminMiddleware,
  upload.single("image"),
  updateNewsPress
);

router.post(
  "/newspress/delete",
  requireSignin,
  adminMiddleware,
  deleteNewsPressById
);

module.exports = router;
