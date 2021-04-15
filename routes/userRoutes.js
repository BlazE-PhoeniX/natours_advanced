const express = require("express");

const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router.route("/signup").post(authController.signupUser);
router.route("/login").post(authController.loginUser);
router.route("/logout").get(authController.logoutUser);
router.route("/forget-password").post(authController.forgetPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);

router.use(authController.verifyUser);

router.route("/update-password").patch(authController.updatePassword);
router
  .route("/update-profile")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateProfile
  );
router.route("/delete-profile").delete(userController.deleteProfile);
router
  .route("/get-profile")
  .get(userController.getProfile, userController.getOneUser);

router.use(authController.allowOnly("admin"));

router.route("/").get(userController.getUsers);
router
  .route("/:id")
  .get(userController.getOneUser)
  .patch(userController.changeUser)
  .delete(userController.deleteUser);

module.exports = router;
