const ApiError = require("../utils/apiError");

const Review = require(`${__dirname}/../models/reviewModel`);
// const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);
// const catchAsync = require(`${__dirname}/../utils/catchAsync`);
// const ApiError = require(`${__dirname}/../utils/apiError`);
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
// exports.createReview = catchAsync(async (req, res, next) => {
//   const review = await Review.create(req.body);

//   res.status(200).json({
//     status: "success",
//     message: "review created successfully",
//     date: {
//       review,
//     },
//   });
// });

exports.getAllReviews = factory.getAll(Review, "Review");
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   if (req.params.tourId) req.query.tour = req.params.tourId;

//   const apiRes = new APIFeatures(Review.find(), req.query);
//   apiRes.filter();

//   const reviews = await apiRes.query;

//   res.status(200).json({
//     status: "success",
//     results: reviews.length,
//     message: "Reviews fetched successfully",
//     data: {
//       reviews,
//     },
//   });
// });

exports.getOneReview = factory.getOne(Review, "Review");
// exports.getOneReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id, {
//     __v: false,
//   });

//   if (!review) return new ApiError("Invalid Tour Id");

//   res.status(200).json({
//     status: "success",
//     message: "Review fetched successfully",
//     data: {
//       review,
//     },
//   });
// });

exports.deleteReview = factory.deleteOne(Review, "Review");

exports.updateReview = factory.updateOne(Review, "Review");
