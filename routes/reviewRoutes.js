const express = require("express");

const reviewController = require(`${__dirname}/../controllers/reviewController`);
const authController = require(`${__dirname}/../controllers/authController`);

// /reviews and /tours/:tourId/reviews both end up as the root of this router
// since tourId is a parameter defined in another router, we need to specify a special property to access it
const router = express.Router({ mergeParams: true });

router.get(
  "/",
  reviewController.setTourDetails,
  reviewController.getAllReviews
);
router.get("/:id", reviewController.getOneReview);

router.use(authController.verifyUser, authController.allowOnly("user"));

router
  .route("/")
  .post(
    reviewController.setTourUserDetails,
    reviewController.checkIfReviewExists,
    reviewController.createReview
  );

router
  .route("/:id")
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
