const express = require("express");
const router = express.Router();

const {
  requireSignin,
  adminMiddleware,
  upload,
} = require("../common-middleware");

const {
  createCareClean,
  getCareCleanById,
  deleteCareCleanById,
  getCareCleans,
  updateCareClean,
} = require("../controllers/careClean");

router.post(
  "/careclean/create",
  requireSignin,
  adminMiddleware,
  upload.single('image'),
  createCareClean
);

router.get("/careclean/:id", getCareCleanById);
router.post("/careclean/getcarecleans", getCareCleans);

router.post(
  "/careclean/delete",
  requireSignin,
  adminMiddleware,
  deleteCareCleanById
);

router.patch(
  "/careclean/update",
  requireSignin,
  adminMiddleware,
  upload.single('image'),
  updateCareClean
);

module.exports = router;
