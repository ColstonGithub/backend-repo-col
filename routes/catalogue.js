const express = require("express");
const router = express.Router();

const {
  addCatalogue,
  getCatalogueDetailsById,
  deleteCatalogueById,
  getCatalogue,
  updateCatalogue,
} = require("../controllers/catalogue");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
  upload,
} = require("../common-middleware");

router.post(
  "/catalogue/create",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 10 },
  ]),
  addCatalogue
);

router.get("/catalogue/getcatalogue", getCatalogue);
router.get("/catalogue/:id", getCatalogueDetailsById);

router.patch(
  "/catalogue/update",
  requireSignin,
  adminMiddleware,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 10 },
  ]),
  updateCatalogue
);

router.post(
  "/catalogue/delete",
  requireSignin,
  adminMiddleware,
  deleteCatalogueById
);

module.exports = router;
