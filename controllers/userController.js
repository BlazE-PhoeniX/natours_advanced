const multer = require("multer");
const sharp = require("sharp");
const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const ApiError = require(`${__dirname}/../utils/apiError`);
const factory = require(`${__dirname}/../utils/handlerFactory`);

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
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

const filterObj = (obj, ...allowedFields) =>
  Object.keys(obj).reduce((acc, el) => {
    if (allowedFields.includes(el)) acc[el] = obj[el];
    return acc;
  }, {});

exports.getUsers = factory.getAll(User, "User");

exports.getOneUser = factory.getOne(User, "User");
// exports.getOneUser = factory.getOne(User, "User", {
//   path: "bookings",
//   select: "user",
// });

exports.changeUser = factory.updateOne(User, "User");

exports.deleteUser = factory.deleteOne(User, "User");

exports.getProfile = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ApiError(400, "fail", "Password cannot be updated in this page.")
    );
  }

  const filteredObj = filterObj(req.body, "name", "email");
  if (req.file) filteredObj.photo = req.file.filename;

  console.log(filteredObj);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "User data updated successfully",
    date: {
      user: updatedUser,
    },
  });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
    date: null,
  });
});
