const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: `${__dirname}/config.env` });

const app = require(`${__dirname}/app`);

process.on("uncaughtException", err => {
  console.log(`<<<< Uncaught exception >>>`);
  console.log(`${err.name}: ${err.message}`);
  console.log(`Shutting down...`);
  process.exit(1);
});

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

let port = process.env.PORT || 3300;
const server = app.listen(port, () => {
  console.log("listening to port " + port);
});

process.on("unhandledRejection", err => {
  console.log(`<<<< Unhandled rejection >>>`);
  console.log(`${err.name}: ${err.message}`);
  console.log(`Shutting down...`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log(`<<<< Termination signal received >>>`);
  console.log(`Shutting down...`);
  server.close(() => {
    console.log("Processes executed successfully....");
  });
});
