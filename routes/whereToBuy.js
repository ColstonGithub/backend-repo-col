const express = require("express");
const router = express.Router();

const {
  addWhereToBuy,
  getWhereToBuyDetailsById,
  deleteWhereToBuyById,
  getWhereToBuyCenters,
  updateWhereToBuy,getFilterWhereToBuyByCity
} = require("../controllers/whereToBuy");

const {
  requireSignin,
  adminMiddleware,
  // superAdminMiddleware,
} = require("../common-middleware");

router.post(
  "/whereToBuy/create",
  requireSignin,
  adminMiddleware,
  addWhereToBuy
);

router.get("/whereToBuy/getWhereToBuyCenters", getWhereToBuyCenters);
router.get("/whereToBuy/:id", getWhereToBuyDetailsById);


router.post("/whereToBuy/getFilterWhereToBuyByCity", getFilterWhereToBuyByCity);

router.patch(
  "/whereToBuy/update",
  requireSignin,
  adminMiddleware,
  updateWhereToBuy
);

router.post(
  "/whereToBuy/delete",
  requireSignin,
  adminMiddleware,
  deleteWhereToBuyById
);

module.exports = router;
