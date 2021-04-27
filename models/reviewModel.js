const mongoose = require("mongoose");
const Tour = require("./tourModel");

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please write a review"],
    },

    rating: {
      type: Number,
      min: [1, "rating must be greater than 1"],
      max: [5, "rating must be less than 5"],
      required: [true, "Please give a rating"],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must be written by a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

ReviewSchema.statics.calcRatingsAverage = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numRatings: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRatings,
      ratingsQuantity: stats[0].numRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

ReviewSchema.post("save", function (doc) {
  doc.constructor.calcRatingsAverage(doc.tour);
});

// jonas method
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.findOne();
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  this.doc.constructor.calcRatingsAverage(this.doc.tour);
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
