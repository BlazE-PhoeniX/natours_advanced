const fs = require("fs/promises");
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
    const toursData = JSON.parse(await fs.readFile(`${__dirname}/tours.json`));
    const usersData = JSON.parse(await fs.readFile(`${__dirname}/users.json`));
    const reviewsData = JSON.parse(
      await fs.readFile(`${__dirname}/reviews.json`)
    );
    await Tour.create(toursData);
    await User.create(usersData, { validateBeforeSave: false });
    await Review.create(reviewsData);

    console.log("File imported successfully");
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

importData();
