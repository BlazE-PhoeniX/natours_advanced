const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"], //second one is a error string
      unique: true,
      trim: true,
      minlength: [10, "Name must be greater than 10 characters"],
      maxlength: [40, "Name must be less than 40 characters"],

      // validation with 3rd party library
      // validate: [validator.isAlpha, "Name must only contain letters"],
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },

    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },

    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Invalid Difficulty value",
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4,
      min: [1, "rating must be greater than 1"],
      max: [5, "rating must be less than 5"],
      set: val => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "Price must not be null"],
    },

    priceDiscount: {
      type: Number,

      // custom vaidation
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Price Discount must be less than original price",
      },
    },

    summary: {
      trim: true,
      type: String,
      required: [true, "A tour must have a summary"],
    },

    description: {
      trim: true,
      type: String,
      required: [true, "A tour must have a description"],
    },

    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hides this field from the user
    },

    startDates: [Date],

    secret: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      // geoJSON data - location based
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],

      // additional properties not neccessary
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    // embedding
    // guides: Array,

    // child referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ difficulty: 1 });
tourSchema.index({ price: 1 }); // simple index
tourSchema.index({ ratingsAverage: -1, price: 1 }); // compound index
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return Math.floor(this.duration / 7);
});

// populating virtual field reviews
// these fields are only shown if they are populated
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// * mongodb middlewares

// Document middlewares
// pre saving => this points to the object to add
tourSchema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });

  // specifying only the user id manually, automatically fetch the user doc and embed it in tour
  // const guidePromises = this.guides.map(async id => await User.findById(id));
  // this.guides = await Promise.all(guidePromises);

  next();
});

// post saving => first parameter points to inserted doc
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
// });

// Query middlewares
// pre finding => this points to the query to execute
tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });

  // populating the tour doc with the user doc at guides field (it will be shown only as embedded while fetching, but in database only the user id is stored)
  // this affects performance
  this.populate({
    path: "guides",
    select:
      "-__v -password -lastPasswordChange -passwordResetToken -passwordResetTokenExpiresIn -_id",
  });

  this.start = Date.now();
  next();
});

// post s => first parameter points to fetched docs
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

// Aggregate middlewares
// pre aggregating => this points to the aggregate object, this.pipeline points to the array which we specified
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $match: { secret: { $ne: true } },
//   });
//   next();
// });

tourSchema.post("aggregate", function (doc, next) {
  // console.log(doc);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
