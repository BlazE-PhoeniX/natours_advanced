const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name must not be a empty string"],
    },

    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user",
    },

    email: {
      type: String,
      unique: [true, "User email must be unique"],
      validate: [
        validator.isEmail,
        "Email not valid, please provide valid email id",
      ],
      lowercase: true,
      required: [true, "User must provide an email"],
    },

    photo: { type: String, default: "default.jpg" },

    password: {
      type: String,
      minlength: 8,
      required: [true, "User must provide a password"],
      select: false,
    },

    passwordConfirm: {
      type: String,
      minlength: 8,
      required: [true, "User must provide a password"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords doesn't match",
      },
    },

    lastPasswordChange: Date,

    passwordResetToken: String,

    passwordResetTokenExpiresIn: Date,

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  if (this.isNew) return next();

  this.lastPasswordChange = Date.now() - 1000;

  next();
});

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.comparePasswords = function (userPassword, dbPassword) {
  return bcrypt.compare(userPassword, dbPassword);
};

UserSchema.methods.changedPassword = function (JWTTimeStamp) {
  if (this.lastPasswordChange) {
    return this.lastPasswordChange.getTime() / 1000 > JWTTimeStamp;
  }

  return false;
};

UserSchema.methods.createPasswordResetToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiresIn =
    Date.now() + process.env.PASSWORD_RESET_EXPIRE_TIME * 60 * 1000;

  setTimeout(async () => {
    this.passwordResetToken = undefined;
    this.passwordResetTokenExpiresIn = undefined;
    await this.save({ validateBeforeSave: false });
  }, process.env.PASSWORD_RESET_EXPIRE_TIME * 60 * 1000);

  return token;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
