const express = require("express");

const tourController = require(`${__dirname}/../controllers/tourController`);
const authController = require(`${__dirname}/../controllers/authController`);

const reviewRouter = require(`${__dirname}/reviewRoutes`);

const router = express.Router();

// so we are gonna redirect these request to review router
router.use("/:tourId/reviews", reviewRouter);

router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/monthly-plan/:year")
  .get(
    authController.verifyUser,
    authController.allowOnly("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/top-5-tours")
  .get(tourController.aliasTopTours, tourController.getTours);

router
  .route("/tours-within/:distance/coords/:coords/unit/:unit")
  .get(tourController.getToursWithin);

router.route("/distance/:coords/unit/:unit").get(tourController.getDistance);

router
  .route("/")
  .get(tourController.getTours)
  .post(
    authController.verifyUser,
    authController.allowOnly("admin", "lead-guide"),
    tourController.addNewTour
  );

router
  .route("/:id")
  .get(tourController.getOneTour)
  .patch(
    authController.verifyUser,
    authController.allowOnly("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.changeTour
  )
  .delete(
    authController.verifyUser,
    authController.allowOnly("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
