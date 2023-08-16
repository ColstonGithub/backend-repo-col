const express = require("express");
const {
  signup,
  signin,
  signout,
  updateProfile,
  getUserData,
} = require("../../controllers/admin/auth");

const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
} = require("../../validators/auth");
const { requireSignin, upload } = require("../../common-middleware");
const router = express.Router();

router.post(
  "/admin/signup",
  validateSignupRequest,
  isRequestValidated,
  //superAdminMiddleware,
  signup
);

router.post("/admin/signin", validateSigninRequest, isRequestValidated, signin);

router.post("/admin/signout", signout);

router.get("/user", requireSignin, getUserData);

router.post(
  "/admin/updateprofile",
  requireSignin,
  upload.single("profilePicture"),
  updateProfile
);

module.exports = router;
