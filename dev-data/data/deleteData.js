const mongoose = require("mongoose");

const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dotenv.config({ path: `${__dirname}/../../config.env` });
const DBString = process.env.DB_STRING.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

// cloud db
mongoose
  .connect(DBString, {
    useNewUrlParser: "true",
    useCreateIndex: "true",
    useFindAndModify: "false",
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection successful");
  });

const importData = async function () {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Document Deleted successfully");
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

importData();
