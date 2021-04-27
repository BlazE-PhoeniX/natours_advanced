const multer = require("multer");
const sharp = require("sharp");
const Tour = require(`${__dirname}/../models/tourModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const ApiError = require(`${__dirname}/../utils/apiError`);
const factory = require(`${__dirname}/../utils/handlerFactory`);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.getTours = factory.getAll(Tour, "Tour");

exports.getOneTour = factory.getOne(Tour, "Tour", {
  path: "reviews",
  select: "-createdAt -__v",
});

exports.addNewTour = factory.createOne(Tour, "Tour");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError(401, "fail", "Please upload a valid image file"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );

  next();
});

exports.changeTour = factory.updateOne(Tour, "Tour");

exports.deleteTour = factory.deleteOne(Tour, "Tour");

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgRating: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: stats.length,
    message: "Tour Stats fetched successfully",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const givenYear = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${givenYear}-01-01`),
          $lte: new Date(`${givenYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: false,
      },
    },
    {
      $sort: {
        numTours: -1,
        month: 1,
      },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    results: plan.length,
    message: "Monthly plan calculated successfully",
    data: { plan },
  });
});

// to use this feature we need the unit in radians
// to convert miles to radians , distance / radius of earth in miles (3963..2)
// to convert km to radians , distance / radius of earth in km (6.378.1)
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, coords, unit } = req.params;
  const [lat, lng] = coords.split(",");

  if (!lat || !lng)
    return next(
      new ApiError(
        403,
        "fail",
        "Coordinates in wrong format. please provide them as lng,long"
      )
    );

  const radius = unit == "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    message: "Tours within the specified radius fetched successfully",
    data: {
      tours,
    },
  });
});

// geoNear must always be the first operator in the aggregate pipeline
// atleast one field must be geo spatial data (index as 2dsphere), if only one it is used by default
// if more keys are used
exports.getDistance = catchAsync(async (req, res, next) => {
  const { coords, unit } = req.params;
  const [lat, lng] = coords.split(",");

  if (!lat || !lng)
    return next(
      new ApiError(
        403,
        "fail",
        "Coordinates in wrong format. please provide them as lng,long"
      )
    );

  const multiplier = unit == "mi" ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "distances for all tours have been calculated successfully",
    data: {
      distances,
    },
  });
});
