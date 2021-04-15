const catchAsync = require("./catchAsync");
const ApiError = require("./apiError");
const APIFeatures = require("./apiFeatures");

exports.deleteOne = (Model, modelName) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) throw new ApiError(404, "fail", `${modelName} not found`);

    const response = {
      status: "success",
      message: `${modelName} deleted successfully`,
      data: {},
    };

    response.data[modelName.toLowerCase()] = doc;

    res.status(200).json(response);
  });

exports.createOne = (Model, modelName) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    const response = {
      status: "success",
      message: `${modelName} created successfully`,
      data: {},
    };

    response.data[modelName.toLowerCase()] = doc;

    res.status(201).json(response);
  });

exports.updateOne = (Model, modelName) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //tells the function to return the new document
      runValidators: true, //tells the function to validate the input as per schema
    });

    if (!doc) throw new ApiError(404, "fail", `${modelName} not found`);

    const response = {
      status: "success",
      message: `${modelName} changed successfully`,
      data: {},
    };

    response.data[modelName.toLowerCase()] = doc;

    res.status(200).json(response);
  });

exports.getOne = (Model, modelName, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id, {
      __v: false,
    });

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) throw new ApiError(404, "fail", `${modelName} not found`);

    const response = {
      status: "success",
      message: `${modelName} fetched successfully`,
      data: {},
    };

    response.data[modelName.toLowerCase()] = doc;

    res.status(200).json(response);
  });

exports.getAll = (Model, modelName) =>
  catchAsync(async (req, res, next) => {
    const apiRes = new APIFeatures(Model.find(), req.query);

    apiRes.filter().sort().limit().paginate();

    const docs = await apiRes.query;

    const response = {
      status: "success",
      results: docs.length,
      message: `${modelName}s fetched successfully`,
      data: {},
    };

    response.data[modelName.toLowerCase() + "s"] = docs;

    res.status(200).json(response);
  });
