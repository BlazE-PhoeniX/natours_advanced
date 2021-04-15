const express = require("express");

const bookingController = require(`${__dirname}/../controllers/bookingController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router.use(authController.verifyUser);

router.route("/checkout/:tourId").get(bookingController.getCheckoutSession);

router.use(authController.allowOnly("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getOneBooking)
  .patch(bookingController.changeBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
