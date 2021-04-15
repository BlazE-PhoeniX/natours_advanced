const express = require("express");

const viewController = require(`${__dirname}/../controllers/viewController`);
const userController = require(`${__dirname}/../controllers/userController`);
const bookingController = require(`${__dirname}/../controllers/bookingController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router.route("/me").get(authController.verifyUser, viewController.getProfile);

router
  .route("/my-tours")
  .get(authController.verifyUser, viewController.getMyTours);

router
  .route("/update-profile")
  .post(
    authController.verifyUser,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    viewController.updateProfile
  );

router.use(authController.isLoggedIn);

router
  .route("/")
  .get(bookingController.createBookingCheckout, viewController.getOverview);

router.route("/overview").get(viewController.getOverview);

router.route("/tour/:tourSlug").get(viewController.getTour);

router.route("/login").get(viewController.getLogin);

router.route("/signup").get(viewController.getSignup);

module.exports = router;
