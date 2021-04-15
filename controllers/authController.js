const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const ApiError = require(`${__dirname}/../utils/apiError`);
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Email = require(`${__dirname}/../utils/email`);
const crypto = require("crypto");

const createToken = async id => {
  return await jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, res) => {
  const token = await createToken(user._id);

  cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  return token;
};

module.exports.signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newlyAddedUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  await new Email(
    newlyAddedUser,
    `${req.protocol}://${req.get("host")}/me`
  ).sendWelcome();

  const token = await createSendToken(newlyAddedUser, res);

  res.status(201).json({
    status: "success",
    message: "user signed up successfully",
    token,
    data: {
      user: {
        name: newlyAddedUser.name,
        email: newlyAddedUser.email,
        photo: newlyAddedUser.photo,
      },
    },
  });
});

module.exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswords(password, user.password)))
    return next(new ApiError(401, "fail", "Invalid email id or password."));

  const token = await createSendToken(user, res);

  res.status(200).json({
    status: "success",
    message: "user logged in successfully",
    token,
  });
};

module.exports.logoutUser = async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 2000),
  });

  res.status(200).json({
    status: "success",
    message: "User loggedout successfully",
    data: null,
  });
};

module.exports.verifyUser = catchAsync(async (req, res, next) => {
  let token;

  let { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) throw new ApiError(401, "fail", "Please login to get access.");

  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(payload.id);

  if (!currentUser)
    throw new ApiError(
      401,
      "fail",
      "User belonging to this token not found or has been removed."
    );

  if (currentUser.changedPassword(payload.iat))
    throw new ApiError(
      401,
      "fail",
      "User has changed their password. login again."
    );

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

// to render page based on logged in state
module.exports.isLoggedIn = async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next();

  try {
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(payload.id);

    if (!currentUser) return next();

    if (currentUser.changedPassword(payload.iat)) return next();

    res.locals.user = currentUser;

    next();
  } catch (err) {
    next();
  }
};

module.exports.allowOnly = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new ApiError(
        401,
        "fail",
        "User is not authorised to do this action."
      );

    next();
  };
};

module.exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw new ApiError(404, "fail", "User not found with this email..");

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(
      user,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/reset-password/${resetToken}`
    ).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to the mail successfully",
    });
  } catch (err) {
    user.passwordResetToken = user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(err);
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "fail", "Token is invalid or expired");

  ({
    password: user.password,
    passwordConfirm: user.passwordConfirm,
  } = req.body);

  user.passwordResetToken = user.passwordResetTokenExpiresIn = undefined;
  await user.save();

  const token = await createSendToken(user, res);

  res.status(200).json({
    status: "success",
    message: "user password changed successfully",
    token,
  });
});

module.exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!req.body.oldPassword)
    return next(new ApiError(404, "fail", "Old password must not be empty"));

  if (!(await user.comparePasswords(req.body.oldPassword, user.password)))
    return next(new ApiError(401, "fail", "Old password is not valid"));

  ({
    password: user.password,
    passwordConfirm: user.passwordConfirm,
  } = req.body);

  await user.save();

  const token = await createSendToken(user, res);

  res.status(200).json({
    status: "success",
    message: "user password changed successfully",
    token,
  });
});
