const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const ApiError = require(`${__dirname}/utils/apiError`);
const globalErrorController = require(`${__dirname}/controllers/errorController`);

const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const bookingRouter = require(`${__dirname}/routes/bookingRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter = require(`${__dirname}/routes/viewRoutes`);

const bookingController = require(`${__dirname}/controllers/bookingController`);

const { getFileStream } = require(`${__dirname}/utils/s3`);

const app = express();
app.enable("trust proxy");

// to initialise pug templates
app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingController.getWebhookCheckout
);

// parses body and limits size
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// to allow cross origin requests
app.use(cors());

// to allow complex requests from cross origin (origin is simply the host url)
app.options("*", cors());

// protects against no sql attacks
app.use(mongoSanitize());

// protects against cross site scripting
app.use(xss());

// protects against parameter pollution (Removes duplicates)
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// compression text in response
app.use(compression());

// limits requests from a particular ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests. try again after an hour",
});
app.use("/api", limiter);

// testing middleware
app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.get(`/images/:folder/:file`, (req, res) => {
  const filekey = `${req.params.folder}/${req.params.file}`;
  getFileStream(filekey).pipe(res);
});

app.use("/", viewRouter);
app.use("/bookings", bookingRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(
    new ApiError(404, "fail", `Cant find ${req.originalUrl} on this server`)
  );
});

// Handle all errors all together
app.use(globalErrorController);

module.exports = app;
