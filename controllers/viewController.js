const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const Booking = require("../models/bookingModel");
// const Review = require("./../models/reviewModel");

const catchAsync = require("./../utils/catchAsync");
const ApiError = require("./../utils/apiError");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: "reviews",
    fields: "user review rating",
  });

  if (!tour)
    return next(new ApiError(404, "fail", "The requested tour was not found!"));

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render("signup", {
    title: "Sign up",
  });
};

exports.getProfile = (req, res) => {
  res.status(200).render("account", {
    title: "My Profile",
  });
};

exports.updateProfile = catchAsync(async (req, res) => {
  const fields = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.file) fields.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(201).render("account", {
    title: "My Profile",
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map(booking => booking.tour.id);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});
