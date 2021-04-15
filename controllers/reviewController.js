const ApiError = require("../utils/apiError");

const Review = require(`${__dirname}/../models/reviewModel`);
const factory = require(`${__dirname}/../utils/handlerFactory`);

exports.setTourUserDetails = (req, res, next) => {
  req.body.createdAt = Date.now();
  req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};

exports.setTourDetails = (req, res, next) => {
  if (req.params.tourId) req.query.tour = req.params.tourId;
  next();
};

exports.checkIfReviewExists = async (req, res, next) => {
  const review = await Review.findOne({
    user: req.body.user,
    tour: req.body.tour,
  });

  if (review)
    return next(
      new ApiError(
        403,
        "fail",
        "User has already written a review for this tour."
      )
    );
};

exports.createReview = factory.createOne(Review, "Review");

exports.getAllReviews = factory.getAll(Review, "Review");

exports.getOneReview = factory.getOne(Review, "Review");

exports.deleteReview = factory.deleteOne(Review, "Review");

exports.updateReview = factory.updateOne(Review, "Review");
